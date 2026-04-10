import type { Message, Settings } from '../types';
import type { GigaChatRequest, GigaChatMessage, GigaChatResponse, GigaChatTokenResponse, GigaChatStreamChunk } from './types';

const AUTH_URL = 'https://auth.api.sber.ru/oauth/token';
const API_URL = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions';
const TOKEN_CACHE = new Map<string, { token: string; expiresAt: number }>();

export class GigaChatService {
  /**
   * Get access token for GigaChat API
   */
  static async getAccessToken(authKey: string): Promise<string> {
    const cacheKey = authKey;
    const cached = TOKEN_CACHE.get(cacheKey);

    // Check if we have a cached token that hasn't expired
    if (cached && cached.expiresAt > Date.now()) {
      return cached.token;
    }

    try {
      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${authKey}`,
        },
        body: 'grant_type=client_credentials&scope=GIGACHAT_API_PERS',
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`);
      }

      const data = (await response.json()) as GigaChatTokenResponse;
      const expiresAt = data.expires_at;

      // Cache the token
      TOKEN_CACHE.set(cacheKey, {
        token: data.access_token,
        expiresAt,
      });

      return data.access_token;
    } catch (error) {
      console.error('Error getting GigaChat access token:', error);
      throw new Error('Не удалось получить токен доступа. Проверьте учетные данные.');
    }
  }

  /**
   * Send message to GigaChat API with streaming support
   * Returns an async generator for streaming responses
   */
  static async *streamMessage(
    messages: Message[],
    settings: Settings,
    authKey: string,
  ): AsyncGenerator<string, void, unknown> {
    try {
      const token = await this.getAccessToken(authKey);

      // Convert app messages to GigaChat format
      const gigachatMessages: GigaChatMessage[] = messages.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      const request: GigaChatRequest = {
        model: settings.model || 'GigaChat',
        messages: gigachatMessages,
        temperature: settings.temperature || 0.7,
        max_tokens: settings.maxTokens || 1024,
        stream: true,
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6).trim();
              if (!jsonStr || jsonStr === '[DONE]') continue;

              try {
                const json = JSON.parse(jsonStr) as GigaChatStreamChunk;
                if (json.choices?.[0]?.delta?.content) {
                  yield json.choices[0].delta.content;
                }
              } catch (e) {
                console.error('Error parsing stream chunk:', e);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Streaming error:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Send message to GigaChat API without streaming
   */
  static async sendMessage(
    messages: Message[],
    settings: Settings,
    authKey: string,
  ): Promise<string> {
    try {
      const token = await this.getAccessToken(authKey);

      // Convert app messages to GigaChat format
      const gigachatMessages: GigaChatMessage[] = messages.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      const request: GigaChatRequest = {
        model: settings.model || 'GigaChat',
        messages: gigachatMessages,
        temperature: settings.temperature || 0.7,
        max_tokens: settings.maxTokens || 1024,
        stream: false,
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = (await response.json()) as GigaChatResponse;
      return data.choices[0]?.message?.content || 'Ошибка: нет ответа от сервера';
    } catch (error) {
      console.error('Message send error:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }
}
