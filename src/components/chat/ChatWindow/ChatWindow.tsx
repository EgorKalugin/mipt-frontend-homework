import { useState, useEffect, useCallback } from 'react';
import type { Message, Chat } from '../../../types';
import { MessageList } from '../MessageList';
import { InputArea } from '../InputArea';
import { EmptyState } from '../../common/EmptyState';
import styles from './ChatWindow.module.css';

interface ChatWindowProps {
  chat: Chat | null;
  onSendMessage: (message: string) => void;
  onOpenSidebar: () => void;
  onNewChat: () => void;
}

export function ChatWindow({
  chat,
  onSendMessage,
  onOpenSidebar,
  onNewChat,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(chat?.messages ?? []);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMessages(chat?.messages ?? []);
    setIsLoading(false);
  }, [chat?.id]);

  const handleSend = useCallback(
    (content: string) => {
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      onSendMessage(content);

      setTimeout(() => {
        const assistantMessage: Message = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: `Это демонстрационный ответ на ваше сообщение:\n\n> ${content}\n\nВ реальном приложении здесь будет ответ от GigaChat API.`,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1500);
    },
    [onSendMessage],
  );

  const menuIcon = (
    <button
      className={styles.menuButton}
      onClick={onOpenSidebar}
      aria-label="Открыть меню"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
  );

  if (!chat) {
    return (
      <div className={styles.window}>
        <div className={styles.header}>
          {menuIcon}
          <h1 className={styles.title}>GigaChat</h1>
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
          <button className={styles.iconButton} aria-label="Очистить чат">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
      <div className={styles.content}>
        {messages.length > 0 ? (
          <MessageList messages={messages} isTyping={isLoading} />
        ) : (
          <EmptyState
            title="Чат пуст"
            description="Напишите сообщение, чтобы начать диалог"
          />
        )}
        <InputArea onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  );
}
