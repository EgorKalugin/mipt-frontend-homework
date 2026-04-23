export interface GigaChatContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string };
}

export interface GigaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | GigaChatContentPart[];
}

export interface GigaChatRequest {
  model: string;
  messages: GigaChatMessage[];
  temperature: number;
  max_tokens: number;
  stream: boolean;
}

export interface GigaChatChoice {
  message: GigaChatMessage;
  finish_reason: string;
}

export interface GigaChatResponse {
  choices: GigaChatChoice[];
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GigaChatTokenResponse {
  access_token: string;
  expires_at: number;
}

export interface GigaChatStreamChunk {
  choices: Array<{
    delta?: {
      role?: string;
      content?: string;
    };
    finish_reason?: string;
  }>;
}
