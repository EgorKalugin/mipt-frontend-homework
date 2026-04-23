import type { Message, Settings } from '../types';
import type {
  GigaChatRequest,
  GigaChatMessage,
  GigaChatContentPart,
  GigaChatResponse,
  GigaChatTokenResponse,
  GigaChatStreamChunk,
} from './types';

// In dev, Vite proxies these paths to the real GigaChat endpoints (see vite.config.ts).
// In production (Vercel), the same paths are rewritten via vercel.json rewrites.
const AUTH_URL = '/gigachat-auth';
const API_URL = '/gigachat-api/chat/completions';

const TOKEN_CACHE = new Map<string, { token: string; expiresAt: number }>();

function randomUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** Convert a Message to GigaChat API format, including image attachments. */
function toGigaChatMessage(msg: Message): GigaChatMessage {
  if (!msg.attachments || msg.attachments.length === 0) {
    return { role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content };
  }

  const parts: GigaChatContentPart[] = [];
  if (msg.content.trim()) {
    parts.push({ type: 'text', text: msg.content });
  }
  for (const att of msg.attachments) {
    parts.push({ type: 'image_url', image_url: { url: att.data } });
  }
  return { role: msg.role === 'user' ? 'user' : 'assistant', content: parts };
}

export class GigaChatService {
  /**
   * Fetch an OAuth Bearer token from the GigaChat OAuth endpoint.
   * Tokens are cached until they expire.
   */
  static async getAccessToken(authKey: string, scope: string = 'GIGACHAT_API_PERS'): Promise<string> {
    const cacheKey = `${authKey}_${scope}`;
    const cached = TOKEN_CACHE.get(cacheKey);

    if (cached && cached.expiresAt > Date.now() + 30_000) {
      return cached.token;
    }

    try {
      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${authKey}`,
          RqUID: randomUUID(),
        },
        body: `scope=${encodeURIComponent(scope)}`,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => response.statusText);
        throw new Error(`Ошибка авторизации (${response.status}): ${text}`);
      }

      const data = (await response.json()) as GigaChatTokenResponse;
      TOKEN_CACHE.set(cacheKey, { token: data.access_token, expiresAt: data.expires_at });
      return data.access_token;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Не удалось получить токен доступа. Проверьте учётные данные.');
    }
  }

  /**
   * Stream a chat completion from GigaChat, yielding content deltas one-by-one.
   * Pass an AbortSignal to support "Stop generation".
   */
  static async *streamMessage(
    messages: Message[],
    settings: Settings,
    authKey: string,
    signal?: AbortSignal,
  ): AsyncGenerator<string, void, unknown> {
    const token = await this.getAccessToken(authKey, settings.scope);

    const gigachatMessages: GigaChatMessage[] = [
      { role: 'system', content: 'Ты полезный ассистент.' },
      ...messages.map(toGigaChatMessage),
    ];

    const request: GigaChatRequest = {
      model: settings.model || 'GigaChat',
      messages: gigachatMessages,
      temperature: settings.temperature ?? 0.7,
      max_tokens: settings.maxTokens ?? 1024,
      stream: true,
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
      signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      throw new Error(`Ошибка API (${response.status}): ${text}`);
    }

    if (!response.body) throw new Error('Нет тела ответа от сервера');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;

          try {
            const json = JSON.parse(jsonStr) as GigaChatStreamChunk;
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) yield delta;
          } catch {
            // Ignore malformed SSE chunks
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Non-streaming fallback: returns the full response text at once.
   */
  static async sendMessage(
    messages: Message[],
    settings: Settings,
    authKey: string,
    signal?: AbortSignal,
  ): Promise<string> {
    const token = await this.getAccessToken(authKey, settings.scope);

    const gigachatMessages: GigaChatMessage[] = [
      { role: 'system', content: 'Ты полезный ассистент.' },
      ...messages.map(toGigaChatMessage),
    ];

    const request: GigaChatRequest = {
      model: settings.model || 'GigaChat',
      messages: gigachatMessages,
      temperature: settings.temperature ?? 0.7,
      max_tokens: settings.maxTokens ?? 1024,
      stream: false,
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
      signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      throw new Error(`Ошибка API (${response.status}): ${text}`);
    }

    const data = (await response.json()) as GigaChatResponse;
    return data.choices[0]?.message?.content as string || 'Ошибка: нет ответа от сервера';
  }
}
