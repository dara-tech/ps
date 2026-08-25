import { Router, Request, Response } from 'express';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { ApiResponse } from '../../core/utils/response.util';

export const githubRoutes = Router();

// In-memory cache for GitHub events
let eventsCache: {
  key: string;
  data: any[];
  expiresAt: number;
} | null = null;

githubRoutes.get('/events', async (req: Request, res: Response) => {
  try {
    const rawUser = String(req.query.username || 'dara-tech').trim();
    const owner = rawUser.replace(/_/g, '-');
    const repoName = req.query.repo ? String(req.query.repo).trim() : '';
    const token = req.query.token ? String(req.query.token).trim() : (process.env.GITHUB_TOKEN || '');

    const cacheKey = `${owner}:${repoName}`;
    const now = Date.now();

    // Check cache (5 minutes)
    if (eventsCache && eventsCache.key === cacheKey && eventsCache.expiresAt > now && eventsCache.data.length > 0) {
      return res.json(ApiResponse.success({
        username: owner,
        repo: repoName,
        totalCount: eventsCache.data.length,
        events: eventsCache.data,
        cached: true,
      }));
    }

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'EPR-Desktop-Application',
    };
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    const events: Array<{
      id: string;
      title: string;
      description?: string;
      date: string;
      time: string;
      type: 'task' | 'meeting' | 'milestone' | 'reminder';
      priority: 'low' | 'medium' | 'high' | 'urgent';
      isCompleted: boolean;
    }> = [];
    const eventIdSet = new Set<string>();

    const addEventSafely = (ev: (typeof events)[0]) => {
      if (!eventIdSet.has(ev.id)) {
        eventIdSet.add(ev.id);
        events.push(ev);
      }
    };

    let isRateLimited = false;

    // 1. Fetch User Events from GitHub REST API
    try {
      const userEventsRes = await fetch(`https://api.github.com/users/${owner}/events?per_page=100`, { headers });
      if (userEventsRes.status === 403) {
        isRateLimited = true;
      } else if (userEventsRes.ok) {
        const uEvents = (await userEventsRes.json()) as any[];
        if (Array.isArray(uEvents)) {
          for (const ev of uEvents) {
            const dateObj = new Date(ev.created_at || Date.now());
            const evDate = dateObj.toISOString().split('T')[0];
            const evTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const repoLabel = ev.repo?.name || owner;

            if (ev.type === 'PushEvent') {
              const commits = ev.payload?.commits || [];
              if (commits.length > 0) {
                for (const c of commits) {
                  const firstLine = (c.message || 'Git commit').split('\n')[0];
                  addEventSafely({
                    id: `gh-ev-push-${c.sha || ev.id}`,
                    title: `[Git Commit] ${firstLine}`,
                    description: `Repo: ${repoLabel} • Ref: ${ev.payload?.ref || 'main'}`,
                    date: evDate,
                    time: evTime,
                    type: 'task',
                    priority: 'medium',
                    isCompleted: true,
                  });
                }
              } else {
                addEventSafely({
                  id: `gh-ev-push-${ev.id}`,
                  title: `[Git Push] ${repoLabel}`,
                  description: `Pushed to ${ev.payload?.ref || 'main'}`,
                  date: evDate,
                  time: evTime,
                  type: 'task',
                  priority: 'medium',
                  isCompleted: true,
                });
              }
            } else if (ev.type === 'CreateEvent') {
              addEventSafely({
                id: `gh-ev-create-${ev.id}`,
                title: `[Git Create] ${ev.payload?.ref_type || 'branch'} in ${repoLabel}`,
                description: `Created ${ev.payload?.ref || 'branch'}`,
                date: evDate,
                time: evTime,
                type: 'task',
                priority: 'low',
                isCompleted: true,
              });
            } else if (ev.type === 'PullRequestEvent') {
              const pr = ev.payload?.pull_request;
              if (pr) {
                addEventSafely({
                  id: `gh-ev-pr-${pr.id || ev.id}`,
                  title: `[PR #${pr.number}] ${pr.title}`,
                  description: `Repo: ${repoLabel} • Status: ${pr.state}`,
                  date: evDate,
                  time: evTime,
                  type: 'task',
                  priority: 'high',
                  isCompleted: pr.state === 'closed',
                });
              }
            } else if (ev.type === 'ReleaseEvent') {
              const rel = ev.payload?.release;
              if (rel) {
                addEventSafely({
                  id: `gh-ev-rel-${rel.id || ev.id}`,
                  title: `[Release] ${rel.tag_name || rel.name}`,
                  description: `Repo: ${repoLabel} • ${rel.name || 'Release deployment'}`,
                  date: evDate,
                  time: evTime,
                  type: 'meeting',
                  priority: 'urgent',
                  isCompleted: true,
                });
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('[GitHub Router] User events fetch error:', e);
    }

    // 2. Fetch specific repository OR all repositories of the user from GitHub API
    const targetRepos: string[] = [];
    if (repoName) {
      targetRepos.push(repoName);
    } else if (!isRateLimited) {
      try {
        const reposRes = await fetch(`https://api.github.com/users/${owner}/repos?per_page=100&sort=updated`, { headers });
        if (reposRes.status === 403) {
          isRateLimited = true;
        } else if (reposRes.ok) {
          const repos = (await reposRes.json()) as any[];
          if (Array.isArray(repos)) {
            for (const r of repos) {
              if (r.name) targetRepos.push(r.name);
            }
          }
        }
      } catch (e) {
        console.warn('[GitHub Router] User repos fetch error:', e);
      }
    }

    // 3. Concurrently fetch all commits across the repositories
    if (!isRateLimited && targetRepos.length > 0) {
      const repoTasks = targetRepos.slice(0, 30).map(async (rName) => {
        try {
          const cRes = await fetch(`https://api.github.com/repos/${owner}/${rName}/commits?per_page=100`, { headers });
          if (cRes.ok) {
            const commits = (await cRes.json()) as any[];
            if (Array.isArray(commits)) {
              for (const c of commits) {
                const dateObj = new Date(c.commit?.author?.date || c.commit?.committer?.date || Date.now());
                const evDate = dateObj.toISOString().split('T')[0];
                const evTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const fullMsg = c.commit?.message || 'Git commit';
                const firstLine = fullMsg.split('\n')[0];
                const authorName = c.commit?.author?.name || c.author?.login || owner;
                const shaShort = (c.sha || '').substring(0, 7);

                addEventSafely({
                  id: `gh-c-${c.sha}`,
                  title: `[Git Commit] ${firstLine}`,
                  description: `Repo: ${owner}/${rName} • SHA: ${shaShort} • Author: ${authorName}`,
                  date: evDate,
                  time: evTime,
                  type: 'task',
                  priority: 'medium',
                  isCompleted: true,
                });
              }
            }
          }
        } catch {}

        try {
          const mRes = await fetch(`https://api.github.com/repos/${owner}/${rName}/milestones?state=all&per_page=30`, { headers });
          if (mRes.ok) {
            const milestones = (await mRes.json()) as any[];
            if (Array.isArray(milestones)) {
              for (const m of milestones) {
                const dueRaw = m.due_on || m.created_at;
                const dateObj = dueRaw ? new Date(dueRaw) : new Date();
                const evDate = dateObj.toISOString().split('T')[0];

                addEventSafely({
                  id: `gh-m-${m.id}`,
                  title: `[Milestone] ${m.title}`,
                  description: `Repo: ${owner}/${rName} • ${m.description || 'Milestone goal'}`,
                  date: evDate,
                  time: '05:00 PM',
                  type: 'milestone',
                  priority: 'high',
                  isCompleted: m.state === 'closed',
                });
              }
            }
          }
        } catch {}

        try {
          const relRes = await fetch(`https://api.github.com/repos/${owner}/${rName}/releases?per_page=30`, { headers });
          if (relRes.ok) {
            const releases = (await relRes.json()) as any[];
            if (Array.isArray(releases)) {
              for (const r of releases) {
                const pubDate = r.published_at || r.created_at;
                const dateObj = pubDate ? new Date(pubDate) : new Date();
                const evDate = dateObj.toISOString().split('T')[0];
                const evTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                addEventSafely({
                  id: `gh-r-${r.id}`,
                  title: `[Release] ${r.tag_name || r.name || 'Version Release'}`,
                  description: `Repo: ${owner}/${rName} • ${r.name || 'Release deployment'}`,
                  date: evDate,
                  time: evTime,
                  type: 'meeting',
                  priority: 'urgent',
                  isCompleted: true,
                });
              }
            }
          }
        } catch {}
      });

      await Promise.allSettled(repoTasks);
    }

    // 4. Scan all local project git repositories in Developments (2026, 2027, etc.) for ALL full commit history
    const scanDirRecursively = (dir: string, depth = 0) => {
      if (depth > 3) return;
      if (!fs.existsSync(dir)) return;

      if (fs.existsSync(path.join(dir, '.git'))) {
        try {
          const gitLogOutput = execSync(
            'git log --pretty=format:"%H|%s|%an|%ad" --date=iso',
            { cwd: dir, encoding: 'utf-8', timeout: 4000 }
          );
          const lines = gitLogOutput.split('\n').filter(Boolean);
          const repoLabel = path.basename(dir);
          for (const line of lines) {
            const parts = line.split('|');
            if (parts.length >= 4) {
              const sha = parts[0].trim();
              const msg = parts[1].trim();
              const author = parts[2].trim();
              const rawDate = parts[3].trim();
              const dateObj = new Date(rawDate);
              const evDate = dateObj.toISOString().split('T')[0];
              const evTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              addEventSafely({
                id: `gh-local-${sha}`,
                title: `[Git Commit] ${msg}`,
                description: `Repo: ${owner}/${repoLabel} • SHA: ${sha.substring(0, 7)} • Author: ${author}`,
                date: evDate,
                time: evTime,
                type: 'task',
                priority: 'medium',
                isCompleted: true,
              });
            }
          }
        } catch (e) {}
        return;
      }

      try {
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
          if (entry === 'node_modules' || entry === '.git' || entry === '.gemini' || entry === 'build' || entry === 'dist') continue;
          const fullPath = path.join(dir, entry);
          try {
            if (fs.statSync(fullPath).isDirectory()) {
              scanDirRecursively(fullPath, depth + 1);
            }
          } catch (e) {}
        }
      } catch (e) {}
    };

    const devRoots = [
      '/Users/cheolsovandara/Documents/D/Developments/2026',
      '/Users/cheolsovandara/Documents/D/Developments/2027',
      path.resolve(__dirname, '../../../../'),
    ];

    for (const r of devRoots) {
      scanDirRecursively(r);
    }

    // Sort events by date descending
    events.sort((a, b) => b.date.localeCompare(a.date));

    // Save to cache
    eventsCache = {
      key: cacheKey,
      data: events,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    res.json(ApiResponse.success({
      username: owner,
      repo: repoName,
      totalCount: events.length,
      isRateLimited,
      events,
    }));
  } catch (err: any) {
    console.error('[GitHub API Route Error]', err);
    res.status(500).json(ApiResponse.error(err.message || 'Failed fetching GitHub events'));
  }
});
