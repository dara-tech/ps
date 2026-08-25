import { db } from '../../data/db';
import { config } from '../../core/config/env.config';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';

export const AVAILABLE_GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.7-flash',
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class AIService {
  private apiKey: string;

  constructor() {
    this.apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY || '';
  }

  private getActiveApiKey(): string {
    return this.apiKey || process.env.GEMINI_API_KEY || '';
  }

  /**
   * Returns list of supported Google Gemini models and connection status
   */
  public async listModels(): Promise<{ models: string[]; isAiOnline: boolean; provider: string }> {
    const key = this.getActiveApiKey();
    return {
      models: AVAILABLE_GEMINI_MODELS,
      isAiOnline: Boolean(key),
      provider: 'Google Gemini',
    };
  }

  /**
   * Generates conversational AI response using Google Gemini API with smart rate-limit retry & multi-model fallback pool
   */
  public async chat(
    params: {
      model?: string;
      messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    },
    retryCount = 0
  ): Promise<{ message: { role: string; content: string }; model: string }> {
    const key = this.getActiveApiKey();
    let modelName = params.model || 'gemini-2.5-flash';
    if (modelName.startsWith('models/')) {
      modelName = modelName.replace('models/', '');
    }

    if (!key) {
      return {
        message: {
          role: 'assistant',
          content: '⚠️ **Gemini API Key Required**\n\nPlease configure your `GEMINI_API_KEY` in `backend/.env` to enable cloud AI reasoning.',
        },
        model: modelName,
      };
    }

    // Convert messages to Gemini format
    let systemInstruction = '';
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    for (const m of params.messages) {
      if (m.role === 'system') {
        systemInstruction += (systemInstruction ? '\n' : '') + m.content;
      } else {
        contents.push({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        });
      }
    }

    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: 'Hello' }],
      });
    }

    // Default system instruction for clean formatting
    const defaultInstruction = 'You are an intelligent, concise AI copilot. Provide clear, well-structured, natural responses. Keep typography clean and readable with neat paragraphs, clean bullet points when listing items, and avoid unnecessary markdown clutter.';
    const finalSystemInstruction = systemInstruction
      ? `${defaultInstruction}\n\n${systemInstruction}`
      : defaultInstruction;

    const payload: any = {
      contents,
      systemInstruction: {
        parts: [{ text: finalSystemInstruction }],
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    };


    try {
      const endpoint = `${GEMINI_API_URL}/models/${modelName}:generateContent?key=${key}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data?.error?.message || `HTTP ${res.status}`;
        console.warn(`[Gemini] Status ${res.status} on ${modelName}:`, errorMsg);

        // Fallback chain across active models with distinct quota pools
        const fallbackChain: Record<string, string> = {
          'gemini-3.7-flash': 'gemini-3.5-flash',
          'gemini-2.5-flash': 'gemini-3.5-flash',
          'gemini-3.5-flash': 'gemini-3.6-flash',
          'gemini-3.6-flash': 'gemini-3.1-flash-lite',
        };

        const nextModel = fallbackChain[modelName];
        if (nextModel && (res.status === 429 || res.status === 503 || errorMsg.includes('quota') || errorMsg.includes('high demand'))) {
          console.log(`[Gemini] Auto-switching from ${modelName} to ${nextModel}...`);
          return this.chat({ ...params, model: nextModel }, retryCount);
        }

        if (retryCount < 2 && (res.status === 429 || errorMsg.includes('retry'))) {
          await sleep(1500);
          return this.chat(params, retryCount + 1);
        }

        return {
          message: {
            role: 'assistant',
            content: `⚡ **Gemini AI Service Notice**\n\n${errorMsg}`,
          },
          model: modelName,
        };
      }

      const generatedText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        'No response generated from Gemini.';

      return {
        message: {
          role: 'assistant',
          content: generatedText,
        },
        model: modelName,
      };
    } catch (err: any) {
      console.error('Gemini chat request failed:', err);

      if (retryCount < 2) {
        await sleep(1000);
        return this.chat(params, retryCount + 1);
      }

      return {
        message: {
          role: 'assistant',
          content: `⚡ **Gemini Connection Error**\n\nCould not reach Google Gemini API (${err.message}). Check your internet connection.`,
        },
        model: modelName,
      };
    }
  }

  /**
   * Uses Gemini to break down a high-level goal into actionable subtasks
   */
  public async breakdownGoal(
    goalTitle: string,
    model?: string
  ): Promise<Array<{ title: string; priority: string; estimatedHours: number }>> {
    const prompt = `You are a high-efficiency productivity assistant. Break down the following personal goal into 3 to 5 clear, concrete subtasks:
Goal: "${goalTitle}"

Respond ONLY with a valid JSON array matching this schema without markdown fences:
[
  { "title": "Subtask title", "priority": "urgent" | "high" | "medium" | "low", "estimatedHours": number }
]`;

    try {
      const res = await this.chat({
        model: model || 'gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
      });

      const content = res.message.content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Breakdown goal error:', e);
    }

    return [
      { title: `Research and outline roadmap for ${goalTitle}`, priority: 'high', estimatedHours: 2 },
      { title: `Set up core foundation and dependencies`, priority: 'medium', estimatedHours: 3 },
      { title: `Build initial prototype and test iteration`, priority: 'urgent', estimatedHours: 4 },
      { title: `Review and finalize checklist`, priority: 'low', estimatedHours: 1 },
    ];
  }

  /**
   * Uses Gemini to parse natural language into structured expense/income records
   */
  public async parseExpense(
    text: string,
    model?: string
  ): Promise<{
    type: 'expense' | 'income';
    amount: number;
    category: string;
    note: string;
  }> {
    const prompt = `Parse this personal finance transaction into structured JSON:
Text: "${text}"

Respond ONLY with a valid JSON object matching this schema without markdown codeblocks:
{
  "type": "expense" or "income",
  "amount": number,
  "category": "Food & Dining" | "Transportation" | "Housing & Utilities" | "Technology & Software" | "Entertainment" | "Health" | "Income & Freelance" | "General",
  "note": "short clean description"
}`;

    try {
      const res = await this.chat({
        model: model || 'gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
      });

      const content = res.message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.amount && typeof parsed.amount === 'number') {
          return {
            type: parsed.type === 'income' ? 'income' : 'expense',
            amount: Math.abs(parsed.amount),
            category: parsed.category || 'General',
            note: parsed.note || text,
          };
        }
      }
    } catch (e) {
      console.error('Parse expense error:', e);
    }

    const numberMatch = text.match(/\$?(\d+(\.\d+)?)/);
    const amount = numberMatch ? parseFloat(numberMatch[1]) : 10;
    const isIncome =
      text.toLowerCase().includes('received') ||
      text.toLowerCase().includes('salary') ||
      text.toLowerCase().includes('income') ||
      text.toLowerCase().includes('freelance');

    return {
      type: isIncome ? 'income' : 'expense',
      amount,
      category: isIncome ? 'Income & Freelance' : 'General',
      note: text,
    };
  }

  /**
   * Generates a morning AI briefing using Gemini
   */
  public async generateDailyBriefing(model?: string): Promise<{
    summary: string;
    focusSuggestion: string;
    productivityScore: number;
  }> {
    const tasks = db.tasks;
    const todayTasks = tasks.filter((t) => t.status !== 'done');
    const completedTasks = tasks.filter((t) => t.status === 'done');

    try {
      const key = this.getActiveApiKey();
      if (key && todayTasks.length > 0) {
        const taskTitles = todayTasks.map((t) => `- ${t.title} (${t.priority})`).join('\n');
        const prompt = `Based on these active tasks for today:
${taskTitles}

Provide a 1-2 sentence morning summary and 1 key focus suggestion in JSON format:
{
  "summary": "...",
  "focusSuggestion": "..."
}`;

        const res = await this.chat({
          model: model || 'gemini-2.5-flash',
          messages: [{ role: 'user', content: prompt }],
        });

        const jsonMatch = res.message.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            summary: parsed.summary,
            focusSuggestion: parsed.focusSuggestion,
            productivityScore: tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 85,
          };
        }
      }
    } catch (e) {
      // Fallback
    }

    return {
      summary: `Good morning! You have ${todayTasks.length} active tasks on your agenda today, with ${completedTasks.length} already accomplished this week.`,
      focusSuggestion: todayTasks[0]
        ? `Prioritize "${todayTasks[0].title}" first during your deep work window.`
        : 'All primary objectives completed! Great time to plan upcoming side projects.',
      productivityScore: tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 85,
    };
  }
}

export const aiService = new AIService();
