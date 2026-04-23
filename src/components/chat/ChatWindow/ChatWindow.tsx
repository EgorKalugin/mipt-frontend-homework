import { useState, useEffect, useCallback, useRef } from 'react';
import type { Message, MessageAttachment, Chat, Settings } from '../../../types';
import { GigaChatService } from '../../../services/gigachat';
import { MessageList } from '../MessageList';
import { InputArea } from '../InputArea';
import { EmptyState } from '../../common/EmptyState';
import { ErrorBoundary } from '../../common/ErrorBoundary';
import styles from './ChatWindow.module.css';

interface ChatWindowProps {
  chat: Chat | null;
  onSendMessage: (message: string) => void;
  onOpenSidebar: () => void;
  onNewChat: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onAddMessage?: (chatId: string, message: Message) => void;
  onUpdateMessage?: (chatId: string, messageId: string, content: string) => void;
  settings?: Settings;
  authKey?: string;
}

export function ChatWindow({
  chat,
  onSendMessage,
  onOpenSidebar,
  onNewChat,
  theme,
  onToggleTheme,
  onAddMessage,
  onUpdateMessage,
  settings,
  authKey,
}: ChatWindowProps) {
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Reset loading when switching chats
  useEffect(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsLoading(false);
  }, [chat?.id]);

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsLoading(false);
  }, []);

  const handleSend = useCallback(
    (content: string, attachments?: MessageAttachment[]) => {
      if (!chat || !onAddMessage || !settings) return;

      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content,
        attachments,
        timestamp: new Date(),
      };

      onAddMessage(chat.id, userMessage);
      setIsLoading(true);
      onSendMessage(content);

      if (authKey) {
        const controller = new AbortController();
        abortControllerRef.current = controller;

        // Add an empty assistant placeholder immediately so streaming shows incrementally
        const assistantMessageId = `msg-${Date.now() + 1}`;
        const assistantPlaceholder: Message = {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        };
        onAddMessage(chat.id, assistantPlaceholder);

        (async () => {
          try {
            const allMessages = [...chat.messages, userMessage];
            let fullContent = '';

            for await (const chunk of GigaChatService.streamMessage(
              allMessages,
              settings,
              authKey,
              controller.signal,
            )) {
              if (controller.signal.aborted) break;
              fullContent += chunk;
              onUpdateMessage?.(chat.id, assistantMessageId, fullContent);
            }
          } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
              // Stopped by user — leave partial text as-is
            } else {
              const errorText = error instanceof Error ? error.message : 'Неизвестная ошибка';
              onUpdateMessage?.(
                chat.id,
                assistantMessageId,
                `❌ Ошибка API: ${errorText}`,
              );
            }
          } finally {
            abortControllerRef.current = null;
            setIsLoading(false);
          }
        })();
      } else {
        // Demo mode — simulate a response after a short delay
        const assistantMessage: Message = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content:
            'Это демонстрационный ответ.\n\nДля использования реального GigaChat API введите **Client ID** и **Client Secret** на экране авторизации.\n\n```python\nprint("Привет, мир!")\n```',
          timestamp: new Date(),
        };
        setTimeout(() => {
          onAddMessage(chat.id, assistantMessage);
          setIsLoading(false);
        }, 1200);
      }
    },
    [chat, onAddMessage, onUpdateMessage, onSendMessage, settings, authKey],
  );

  const menuIcon = (
    <button className={styles.menuButton} onClick={onOpenSidebar} aria-label="Открыть меню">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
  );

  const themeToggle = onToggleTheme ? (
    <button
      className={styles.iconButton}
      onClick={onToggleTheme}
      aria-label={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
    >
      {theme === 'dark' ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  ) : null;

  if (!chat) {
    return (
      <div className={styles.window}>
        <div className={styles.header}>
          {menuIcon}
          <h1 className={styles.title}>GigaChat</h1>
          <div className={styles.headerActions}>{themeToggle}</div>
        </div>
        <div className={styles.content}>
          <EmptyState
            title="Начните новый чат"
            description="Задайте вопрос или выберите существующий чат из списка слева"
            actionLabel="Новый чат"
            onAction={onNewChat}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.window}>
      <div className={styles.header}>
        {menuIcon}
        <h1 className={styles.title}>{chat.title}</h1>
        <div className={styles.headerActions}>
          {themeToggle}
        </div>
      </div>
      <div className={styles.content}>
        {chat.messages.length > 0 ? (
          <ErrorBoundary>
            <MessageList messages={chat.messages} isTyping={isLoading} />
          </ErrorBoundary>
        ) : (
          <EmptyState
            title="Чат пуст"
            description="Напишите сообщение, чтобы начать диалог"
          />
        )}
        <InputArea onSend={handleSend} isLoading={isLoading} onStop={handleStop} />
      </div>
    </div>
  );
}
