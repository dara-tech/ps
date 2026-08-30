import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { RemixIcon } from '../../../ui/RemixIcon';
import { toast } from '../../../../store/useToastStore';

export function formatMessageDate(dateVal: any, isKh: boolean): string {
  if (!dateVal) return '';
  const d = typeof dateVal === 'number' ? new Date(dateVal) : new Date(dateVal);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (msgDay.getTime() === today.getTime()) {
    return isKh ? 'ថ្ងៃនេះ' : 'Today';
  }
  if (msgDay.getTime() === yesterday.getTime()) {
    return isKh ? 'ម្សិលមិញ' : 'Yesterday';
  }

  return d.toLocaleDateString(isKh ? 'km-KH' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function getConversationStatusText(conv: any, isTelegram: boolean, isKh: boolean): string {
  if (!conv) return '';

  if (conv.isChannel) {
    const count = conv.participantsCount ? `${conv.participantsCount.toLocaleString()} ` : '';
    return `${count}${isKh ? 'អ្នកជាវ' : 'subscribers'}`;
  }

  if (conv.isGroup) {
    const count = conv.participantsCount ? `${conv.participantsCount.toLocaleString()} ` : 'All ';
    return `${count}${isKh ? 'សមាជិក' : 'members'}`;
  }

  if (conv.isBot) {
    return isKh ? 'បូត (Bot)' : 'bot';
  }

  // 1-on-1 direct user
  if (conv.isOnline) {
    return isKh ? 'កំពុងអនឡាញ' : 'online';
  }

  if (conv.userStatus === 'recently') {
    return isKh ? 'បានឃើញថ្មីៗនេះ' : 'last seen recently';
  }

  if (conv.userStatus === 'within_week') {
    return isKh ? 'បានឃើញក្នុងសប្តាហ៍នេះ' : 'last seen within a week';
  }

  if (conv.userStatus === 'within_month') {
    return isKh ? 'បានឃើញក្នុងខែនេះ' : 'last seen within a month';
  }

  if (conv.userStatus && conv.userStatus !== 'online') {
    return `${isKh ? 'បានឃើញនៅម៉ោង' : 'last seen at'} ${conv.userStatus}`;
  }

  return isKh ? 'បានឃើញថ្មីៗនេះ' : 'last seen recently';
}

export function renderFormattedMarkdown(text: string, baseStyle?: any, keyPrefix = 'md'): React.ReactNode {
  if (!text) return null;

  // Match 1. Triple backticks (code block), 2. Bold (** or __), 3. Inline code (`), 4. Strikethrough (~~), 5. Links ([title](url)), 6. URLs, 7. Mentions, 8. Hashtags
  const regex = /(```[\s\S]*?```|\*\*[\s\S]*?\*\*|__[\s\S]*?__|`[^`\n]+`|~~[\s\S]*?~~|\[.*?\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s]+|t\.me\/[^\s]+|@[\w_]+|#[\w_]+)/g;

  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;
    const key = `${keyPrefix}-${index}`;

    // 1. Triple backticks Code Block: ```code```
    if (part.startsWith('```') && part.endsWith('```') && part.length >= 6) {
      let codeContent = part.slice(3, -3);
      const firstLineBreak = codeContent.indexOf('\n');
      if (firstLineBreak > 0 && firstLineBreak < 20 && !codeContent.slice(0, firstLineBreak).includes(' ')) {
        codeContent = codeContent.slice(firstLineBreak + 1);
      }
      codeContent = codeContent.trim();

      return React.createElement(
        TouchableOpacity,
        {
          key,
          activeOpacity: 0.85,
          onPress: () => {
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
              navigator.clipboard.writeText(codeContent);
              toast.success('Copied', 'Code copied to clipboard');
            }
          },
          style: {
            backgroundColor: '#DDF0FA',
            borderRadius: 8,
            padding: 8,
            marginVertical: 4,
            width: '100%',
            overflow: 'hidden',
          },
        },
        React.createElement(
          View,
          {
            style: {
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4,
            },
          },
          React.createElement(
            Text,
            {
              style: {
                fontSize: 11,
                fontFamily: 'Krasar-Bold',
                color: '#0284C7',
              },
            },
            'copy'
          ),
          React.createElement(RemixIcon, { name: 'task-line' as any, size: 13, color: '#0284C7' })
        ),
        React.createElement(
          Text,
          {
            style: {
              fontFamily: 'monospace',
              fontSize: 12,
              lineHeight: 17,
              color: '#0F172A',
            },
          },
          codeContent
        )
      );
    }

    // 2. Bold: **content** or __content__
    if (
      (part.startsWith('**') && part.endsWith('**') && part.length >= 4) ||
      (part.startsWith('__') && part.endsWith('__') && part.length >= 4)
    ) {
      const inner = part.slice(2, -2);
      return React.createElement(
        Text,
        {
          key,
          style: [baseStyle, { fontFamily: 'Krasar-Bold', fontWeight: '700' }],
        },
        inner
      );
    }

    // 3. Inline code: `content`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return React.createElement(
        Text,
        {
          key,
          style: [
            baseStyle,
            {
              fontFamily: 'monospace',
              backgroundColor: '#DDF0FA',
              borderRadius: 4,
              paddingHorizontal: 4,
              paddingVertical: 1,
              color: '#0369A1',
            },
          ],
        },
        inner
      );
    }

    // 4. Strikethrough: ~~content~~
    if (part.startsWith('~~') && part.endsWith('~~') && part.length >= 4) {
      const inner = part.slice(2, -2);
      return React.createElement(
        Text,
        {
          key,
          style: [baseStyle, { textDecorationLine: 'line-through' }],
        },
        inner
      );
    }

    // 5. Markdown link: [Title](https://...)
    const mdLinkMatch = part.match(/^\[(.*?)\]\((https?:\/\/[^\s)]+)\)$/);
    if (mdLinkMatch) {
      const linkTitle = mdLinkMatch[1];
      const linkUrl = mdLinkMatch[2];
      return React.createElement(
        Text,
        {
          key,
          style: [baseStyle, { color: '#0284C7', textDecorationLine: 'underline', cursor: 'pointer' } as any],
          onPress: () => typeof window !== 'undefined' && window.open(linkUrl, '_blank'),
        },
        linkTitle
      );
    }

    // 6. Raw URL: https://... or t.me/...
    if (/^(https?:\/\/|t\.me\/)/.test(part)) {
      const fullUrl = part.startsWith('t.me/') ? `https://${part}` : part;
      return React.createElement(
        Text,
        {
          key,
          style: [baseStyle, { color: '#0284C7', textDecorationLine: 'underline', cursor: 'pointer' } as any],
          onPress: () => typeof window !== 'undefined' && window.open(fullUrl, '_blank'),
        },
        part
      );
    }

    // 7. Mentions / Hashtags: @user or #tag
    if (/^(@|#)/.test(part)) {
      return React.createElement(
        Text,
        {
          key,
          style: [baseStyle, { color: '#0284C7' }],
        },
        part
      );
    }

    // Plain text chunk
    return React.createElement(
      Text,
      {
        key,
        style: baseStyle,
      },
      part
    );
  });
}

export function downloadTelegramFile(url: string, fileName?: string): void {
  if (!url) return;
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'download';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
    }, 200);
    toast.success('Downloading', fileName ? `Downloading ${fileName}...` : 'Downloading file...');
  } catch (err) {
    console.error('Download failed:', err);
  }
}
