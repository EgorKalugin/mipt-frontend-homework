import { useEffect, useCallback } from 'react';
import type { Chat, AuthCredentials } from './types';
import { mockChats, mockUser } from './data/mockData';
import { useAppState } from './hooks/useAppState';
import { AppLayout } from './components/layout/AppLayout';
import { Sidebar } from './components/sidebar/Sidebar';
import { ChatWindow } from './components/chat/ChatWindow';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { AuthForm } from './components/auth/AuthForm';
import './styles/variables.css';

function App() {
  const {
    state: {
      isAuthenticated,
      authLoading,
      authError,
      user,
      chats,
      activeChatId,
      settings,
      isSidebarOpen,
      isSettingsOpen,
    },
    setAuthState,
    setAuthLoading,
    setAuthError,
    initializeAuthData,
    createChat,
    deleteChat,
    renameChat,
    setActiveChat,
    updateSettings,
    toggleTheme,
    setSidebarOpen,
    setSettingsPanelOpen,
    logout,
  } = useAppState();

  const activeChat = chats.find((chat) => chat.id === activeChatId) || null;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  const handleAuth = useCallback((credentials: AuthCredentials) => {
    setAuthLoading(true);
    setAuthError(null);

    setTimeout(() => {
      if (credentials.clientId && credentials.clientSecret) {
        initializeAuthData(mockUser, mockChats);
        setAuthState(true);
      } else {
        setAuthError('Неверные учётные данные');
      }
      setAuthLoading(false);
    }, 1000);
  }, [setAuthLoading, setAuthError, setAuthState, initializeAuthData]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const handleNewChat = useCallback(() => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      title: 'Новый чат',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    createChat(newChat);
    setSidebarOpen(false);
  }, [createChat, setSidebarOpen]);

  const handleDeleteChat = useCallback((chatId: string) => {
    deleteChat(chatId);
  }, [deleteChat]);

  const handleRenameChat = useCallback((chatId: string) => {
    const newTitle = prompt('Введите новое название чата:');
    if (newTitle?.trim()) {
      renameChat(chatId, newTitle.trim());
    }
  }, [renameChat]);

  const handleSelectChat = useCallback((chatId: string) => {
    setActiveChat(chatId);
    setSidebarOpen(false);
  }, [setActiveChat, setSidebarOpen]);

  const handleSendMessage = useCallback((content: string) => {
    if (!activeChatId) return;

    // Update chat title if it's the first message
    const chat = chats.find((c) => c.id === activeChatId);
    if (chat && chat.messages.length === 0) {
      renameChat(activeChatId, content.slice(0, 50) + (content.length > 50 ? '...' : ''));
    }
  }, [activeChatId, chats, renameChat]);

  const handleSaveSettings = useCallback((newSettings: any) => {
    updateSettings(newSettings);
  }, [updateSettings]);

  const handleToggleTheme = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

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
            onOpenSettings={() => setSettingsPanelOpen(true)}
            onLogout={handleLogout}
          />
        }
        isSidebarOpen={isSidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
      >
        <ChatWindow
          chat={activeChat}
          onSendMessage={handleSendMessage}
          onOpenSidebar={() => setSidebarOpen(true)}
          onNewChat={handleNewChat}
          theme={settings.theme}
          onToggleTheme={handleToggleTheme}
        />
      </AppLayout>

      {isSettingsOpen && (
        <SettingsPanel
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setSettingsPanelOpen(false)}
        />
      )}
    </>
  );
}

export default App;
