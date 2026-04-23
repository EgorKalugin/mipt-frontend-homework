export type MessageRole = 'user' | 'assistant';

export interface MessageAttachment {
  type: 'image';
  data: string; // base64 data URL (e.g. "data:image/jpeg;base64,...")
  mimeType: string;
  name?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  attachments?: MessageAttachment[];
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export type Scope = 'GIGACHAT_API_PERS' | 'GIGACHAT_API_CORP' | 'GIGACHAT_API_B2B';

export interface Settings {
  theme: 'light' | 'dark';
  scope: Scope;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface AuthCredentials {
  clientId: string;
  clientSecret: string;
  scope: Scope;
}

export interface AuthKey {
  clientId: string;
  clientSecret: string;
  base64Encoded: string;
}
