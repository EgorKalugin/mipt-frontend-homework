import { lazy, Suspense, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import type { Chat } from './types';
import { mockChats, mockUser } from './data/mockData';
import { useAppState } from './hooks/useAppState';
import { AppLayout } from './components/layout/AppLayout';
import { ChatWindow } from './components/chat/ChatWindow';
import { AuthForm } from './components/auth/AuthForm';
import './styles/variables.css';

const Sidebar = lazy(() =>
  import('./components/sidebar/Sidebar').then((m) => ({ default: m.Sidebar })),
);

const SettingsPanel = lazy(() =>
  import('./components/settings/SettingsPanel').then((m) => ({ default: m.SettingsPanel })),
);

// Chat page component
function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    state: { chats, activeChatId, settings, isSidebarOpen, isSettingsOpen, authKey },
    setActiveChat,
    createChat,
    renameChat,
    updateSettings,
    toggleTheme,
    setSidebarOpen,
    setSettingsPanelOpen,
    addMessage,
    updateMessage,
    deleteChat,
  } = useAppState();

  const chat = id ? chats.find((c) => c.id === id) : chats.find((c) => c.id === activeChatId);

  useEffect(() => {
    if (id && id !== activeChatId) {
      setActiveChat(id);
    }
  }, [id, activeChatId, setActiveChat]);

  const handleSendMessage = useCallback((content: string) => {
    if (!chat) return;
    // Auto-name chat based on the first user message (chat is still empty at this point)
    if (chat.title === 'Новый чат' && chat.messages.length === 0) {
      const newTitle = content.slice(0, 50) + (content.length > 50 ? '...' : '');
      renameChat(chat.id, newTitle);
    }
  }, [chat, renameChat]);

  const handleSelectChat = useCallback((chatId: string) => {
    navigate(`/chat/${chatId}`);
    setSidebarOpen(false);
  }, [navigate, setSidebarOpen]);

  const handleNewChat = useCallback(() => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      title: 'Новый чат',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    createChat(newChat);
    navigate(`/chat/${newChat.id}`);
    setSidebarOpen(false);
  }, [createChat, navigate, setSidebarOpen]);

  const handleSaveSettings = useCallback((newSettings: any) => {
    updateSettings(newSettings);
  }, [updateSettings]);

  const handleToggleTheme = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  const handleDeleteChat = useCallback((chatId: string) => {
    deleteChat(chatId);
  }, [deleteChat]);

  const handleRenameChat = useCallback((chatId: string) => {
    const newTitle = prompt('Введите новое название чата:');
    if (newTitle?.trim()) {
      renameChat(chatId, newTitle.trim());
    }
  }, [renameChat]);

  return (
    <AppLayout
      sidebar={
        <Suspense fallback={<div style={{ width: '100%', height: '100%' }} />}>
          <Sidebar
            chats={chats}
            activeChatId={id || activeChatId}
            user={null}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
            onRenameChat={handleRenameChat}
            onOpenSettings={() => setSettingsPanelOpen(true)}
            onLogout={() => {}}
          />
        </Suspense>
      }
      isSidebarOpen={isSidebarOpen}
      onCloseSidebar={() => setSidebarOpen(false)}
    >
      <ChatWindow
        chat={chat || null}
        onSendMessage={handleSendMessage}
        onOpenSidebar={() => setSidebarOpen(true)}
        onNewChat={handleNewChat}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
        onAddMessage={addMessage}
        onUpdateMessage={updateMessage}
        settings={settings}
        authKey={authKey || undefined}
      />
      {isSettingsOpen && (
        <Suspense fallback={null}>
          <SettingsPanel
            settings={settings}
            onSave={handleSaveSettings}
            onClose={() => setSettingsPanelOpen(false)}
          />
        </Suspense>
      )}
    </AppLayout>
  );
}

// Main App component
function App() {
  const {
    state: {
      isAuthenticated,
      authLoading,
      authError,
      settings,
    },
    setAuthState,
    setAuthLoading,
    setAuthError,
    initializeAuthData,
  } = useAppState();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  const handleAuth = useCallback((credentials: any) => {
    setAuthLoading(true);
    setAuthError(null);

    setTimeout(() => {
      if (credentials.clientId && credentials.clientSecret) {
        // Create auth key (base64 encoded clientId:clientSecret for GigaChat API)
        const authString = `${credentials.clientId}:${credentials.clientSecret}`;
        const authKey = btoa(authString);

        initializeAuthData(mockUser, mockChats, authKey);
        setAuthState(true);
      } else {
        setAuthError('Неверные учётные данные');
      }
      setAuthLoading(false);
    }, 1000);
  }, [setAuthLoading, setAuthError, setAuthState, initializeAuthData]);

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
    <Routes>
      <Route path="/chat/:id" element={<ChatPage />} />
      <Route path="/" element={<ChatPage />} />
    </Routes>
  );
}

export default App;
