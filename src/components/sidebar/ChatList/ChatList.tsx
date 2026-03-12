import type { Chat } from '../../../types';
import { ChatItem } from '../ChatItem';
import styles from './ChatList.module.css';

interface ChatListProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string) => void;
}

export function ChatList({
  chats,
  activeChatId,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
}: ChatListProps) {
  if (chats.length === 0) {
    return (
      <div className={styles.empty}>
        <svg
          className={styles.emptyIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <div className={styles.emptyText}>Чаты не найдены</div>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          isActive={chat.id === activeChatId}
          onClick={() => onSelectChat(chat.id)}
          onDelete={() => onDeleteChat(chat.id)}
          onRename={() => onRenameChat(chat.id)}
        />
      ))}
    </div>
  );
}
