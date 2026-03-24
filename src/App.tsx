import { useState, useEffect, useCallback } from 'react';
import type { Chat, User, Settings, AuthCredentials } from './types';
import { mockChats, mockUser, mockSettings } from './data/mockData';
import { AppLayout } from './components/layout/AppLayout';
import { Sidebar } from './components/sidebar/Sidebar';
import { ChatWindow } from './components/chat/ChatWindow';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { AuthForm } from './components/auth/AuthForm';
import './styles/variables.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(mockSettings);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const activeChat = chats.find((chat) => chat.id === activeChatId) || null;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  const handleAuth = useCallback((credentials: AuthCredentials) => {
    setAuthLoading(true);
    setAuthError(null);

    setTimeout(() => {
      if (credentials.clientId && credentials.clientSecret) {
        setUser(mockUser);
        setChats(mockChats);
        setActiveChatId(mockChats[0]?.id || null);
        setIsAuthenticated(true);
      } else {
        setAuthError('Неверные учётные данные');
      }
      setAuthLoading(false);
    }, 1000);
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    setChats([]);
    setActiveChatId(null);
  }, []);

  const handleNewChat = useCallback(() => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      title: 'Новый чат',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setIsSidebarOpen(false);
  }, []);

  const handleDeleteChat = useCallback((chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    setActiveChatId((currentId) => (currentId === chatId ? null : currentId));
  }, []);

  const handleRenameChat = useCallback((chatId: string) => {
    const newTitle = prompt('Введите новое название чата:');
    if (newTitle?.trim()) {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? { ...chat, title: newTitle.trim(), updatedAt: new Date() }
            : chat
        )
      );
    }
  }, []);

  const handleSelectChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
    setIsSidebarOpen(false);
  }, []);

  const handleSendMessage = useCallback((content: string) => {
    if (!activeChatId) return;

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId && chat.messages.length === 0
          ? {
              ...chat,
              title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
              updatedAt: new Date(),
            }
          : chat
      )
    );
  }, [activeChatId]);

  const handleSaveSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
  }, []);

  if (!isAuthenticated) {
    return (
      <AuthForm
        onSubmit={handleAuth}
        isLoading={authLoading}
        error={authError}
      />
    );
  }

  return (
    <>
      <AppLayout
        sidebar={
          <Sidebar
            chats={chats}
            activeChatId={activeChatId}
            user={user}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
            onRenameChat={handleRenameChat}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onLogout={handleLogout}
          />
        }
        isSidebarOpen={isSidebarOpen}
        onCloseSidebar={() => setIsSidebarOpen(false)}
      >
        <ChatWindow
          chat={activeChat}
          onSendMessage={handleSendMessage}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onNewChat={handleNewChat}
        />
      </AppLayout>

      {isSettingsOpen && (
        <SettingsPanel
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </>
  );
}

export default App;
