import type { Chat } from '../../../types';
import { MessageList } from '../MessageList';
import { InputArea } from '../InputArea';
import { EmptyState } from '../../common/EmptyState';
import styles from './ChatWindow.module.css';

interface ChatWindowProps {
  chat: Chat | null;
  isTyping?: boolean;
  onSendMessage: (message: string) => void;
  onOpenSidebar: () => void;
  onNewChat: () => void;
}

export function ChatWindow({
  chat,
  isTyping = false,
  onSendMessage,
  onOpenSidebar,
  onNewChat,
}: ChatWindowProps) {
  if (!chat) {
    return (
      <div className={styles.window}>
        <div className={styles.header}>
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

  const hasMessages = chat.messages.length > 0;

  return (
    <div className={styles.window}>
      <div className={styles.header}>
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
        {hasMessages ? (
          <MessageList messages={chat.messages} isTyping={isTyping} />
        ) : (
          <EmptyState
            title="Чат пуст"
            description="Напишите сообщение, чтобы начать диалог"
          />
        )}
        <InputArea onSend={onSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
}
