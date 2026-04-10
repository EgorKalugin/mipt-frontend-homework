import { useState, useMemo } from 'react';
import type { Chat, User } from '../../../types';
import { SearchInput } from '../SearchInput';
import { ChatList } from '../ChatList';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import styles from './Sidebar.module.css';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  user: User | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string) => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export function Sidebar({
  chats,
  activeChatId,
  user,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onOpenSettings,
  onLogout,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ chatId: string; chatTitle: string } | null>(
    null,
  );

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    const query = searchQuery.toLowerCase();
    return chats.filter((chat) => {
      // Search by chat title
      if (chat.title.toLowerCase().includes(query)) {
        return true;
      }
      // Search by last message content
      if (chat.messages.length > 0) {
        const lastMessage = chat.messages[chat.messages.length - 1];
        if (lastMessage.content.toLowerCase().includes(query)) {
          return true;
        }
      }
      // Search by any message content
      return chat.messages.some((msg) => msg.content.toLowerCase().includes(query));
    });
  }, [chats, searchQuery]);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDeleteClick = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setDeleteConfirm({ chatId, chatTitle: chat.title });
    }
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      onDeleteChat(deleteConfirm.chatId);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <svg
            className={styles.logoIcon}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          GigaChat
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.iconButton}
            onClick={onOpenSettings}
            aria-label="Настройки"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>

      <button className={styles.newChatButton} onClick={onNewChat}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Новый чат
      </button>

      <div className={styles.search}>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Поиск чатов..."
        />
      </div>

      <ChatList
        chats={filteredChats}
        activeChatId={activeChatId}
        onSelectChat={onSelectChat}
        onDeleteChat={handleDeleteClick}
        onRenameChat={onRenameChat}
      />

      {user && (
        <div className={styles.footer}>
          <div className={styles.userInfo} onClick={onLogout}>
            <div className={styles.avatar}>{getInitials(user.name)}</div>
            <div>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userEmail}>{user.email}</div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <ConfirmDialog
          title="Удалить чат"
          message={`Вы уверены, что хотите удалить чат "${deleteConfirm.chatTitle}"? Это действие невозможно отменить.`}
          confirmLabel="Удалить"
          cancelLabel="Отмена"
          isDangerous={true}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
