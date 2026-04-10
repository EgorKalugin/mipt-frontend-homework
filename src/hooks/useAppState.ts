import { useReducer, useCallback, useEffect } from 'react'
import type { Chat, User, Settings, Message } from '../types'
import { mockSettings } from '../data/mockData'
import { saveState, loadState } from '../utils/storage'

// Action types
export const ACTIONS = {
  SET_AUTH_STATE: 'SET_AUTH_STATE',
  SET_AUTH_LOADING: 'SET_AUTH_LOADING',
  SET_AUTH_ERROR: 'SET_AUTH_ERROR',
  SET_AUTH_KEY: 'SET_AUTH_KEY',
  SET_USER: 'SET_USER',
  INITIALIZE_AUTH_DATA: 'INITIALIZE_AUTH_DATA',
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_MESSAGE: 'UPDATE_MESSAGE',
  CREATE_CHAT: 'CREATE_CHAT',
  DELETE_CHAT: 'DELETE_CHAT',
  RENAME_CHAT: 'RENAME_CHAT',
  SET_ACTIVE_CHAT: 'SET_ACTIVE_CHAT',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  TOGGLE_THEME: 'TOGGLE_THEME',
  SET_SIDEBAR_OPEN: 'SET_SIDEBAR_OPEN',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_SETTINGS_PANEL_OPEN: 'SET_SETTINGS_PANEL_OPEN',
  TOGGLE_SETTINGS_PANEL: 'TOGGLE_SETTINGS_PANEL',
  LOGOUT: 'LOGOUT',
} as const

// State interface
export interface AppState {
  isAuthenticated: boolean
  authLoading: boolean
  authError: string | null
  authKey: string | null
  user: User | null
  chats: Chat[]
  activeChatId: string | null
  settings: Settings
  isSidebarOpen: boolean
  isSettingsOpen: boolean
}

// Union type for all possible actions
export type AppAction =
  | { type: typeof ACTIONS.SET_AUTH_STATE; payload: boolean }
  | { type: typeof ACTIONS.SET_AUTH_LOADING; payload: boolean }
  | { type: typeof ACTIONS.SET_AUTH_ERROR; payload: string | null }
  | { type: typeof ACTIONS.SET_AUTH_KEY; payload: string | null }
  | { type: typeof ACTIONS.SET_USER; payload: User | null }
  | { type: typeof ACTIONS.INITIALIZE_AUTH_DATA; payload: { user: User; chats: Chat[]; authKey?: string } }
  | { type: typeof ACTIONS.ADD_MESSAGE; payload: { chatId: string; message: Message } }
  | { type: typeof ACTIONS.UPDATE_MESSAGE; payload: { chatId: string; messageId: string; content: string } }
  | { type: typeof ACTIONS.CREATE_CHAT; payload: Chat }
  | { type: typeof ACTIONS.DELETE_CHAT; payload: string }
  | { type: typeof ACTIONS.RENAME_CHAT; payload: { chatId: string; newTitle: string } }
  | { type: typeof ACTIONS.SET_ACTIVE_CHAT; payload: string | null }
  | { type: typeof ACTIONS.UPDATE_SETTINGS; payload: Partial<Settings> }
  | { type: typeof ACTIONS.TOGGLE_THEME }
  | { type: typeof ACTIONS.SET_SIDEBAR_OPEN; payload: boolean }
  | { type: typeof ACTIONS.TOGGLE_SIDEBAR }
  | { type: typeof ACTIONS.SET_SETTINGS_PANEL_OPEN; payload: boolean }
  | { type: typeof ACTIONS.TOGGLE_SETTINGS_PANEL }
  | { type: typeof ACTIONS.LOGOUT }

// Initial state function
export const getInitialState = (): AppState => {
  return {
    isAuthenticated: false,
    authLoading: false,
    authError: null,
    authKey: null,
    user: null,
    chats: [],
    activeChatId: null,
    settings: mockSettings,
    isSidebarOpen: false,
    isSettingsOpen: false,
  }
}

// Reducer function
export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case ACTIONS.SET_AUTH_STATE:
      return {
        ...state,
        isAuthenticated: action.payload,
      }

    case ACTIONS.SET_AUTH_LOADING:
      return {
        ...state,
        authLoading: action.payload,
      }

    case ACTIONS.SET_AUTH_ERROR:
      return {
        ...state,
        authError: action.payload,
      }

    case ACTIONS.SET_AUTH_KEY:
      return {
        ...state,
        authKey: action.payload,
      }

    case ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
      }

    case ACTIONS.INITIALIZE_AUTH_DATA: {
      const { user, chats } = action.payload
      return {
        ...state,
        user,
        chats,
        activeChatId: chats.length > 0 ? chats[0].id : null,
        isAuthenticated: true,
      }
    }

    case ACTIONS.ADD_MESSAGE: {
      const { chatId, message } = action.payload
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [...chat.messages, message],
                updatedAt: new Date(),
              }
            : chat
        ),
      }
    }

    case ACTIONS.UPDATE_MESSAGE: {
      const { chatId, messageId, content } = action.payload
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: chat.messages.map((msg) =>
                  msg.id === messageId
                    ? { ...msg, content }
                    : msg
                ),
                updatedAt: new Date(),
              }
            : chat
        ),
      }
    }

    case ACTIONS.CREATE_CHAT: {
      return {
        ...state,
        chats: [action.payload, ...state.chats],
        activeChatId: action.payload.id,
      }
    }

    case ACTIONS.DELETE_CHAT: {
      const chatId = action.payload
      const remainingChats = state.chats.filter((chat) => chat.id !== chatId)
      let newActiveChatId = state.activeChatId

      // If the deleted chat was active, clear the active chat ID
      if (state.activeChatId === chatId) {
        newActiveChatId = remainingChats.length > 0 ? remainingChats[0].id : null
      }

      return {
        ...state,
        chats: remainingChats,
        activeChatId: newActiveChatId,
      }
    }

    case ACTIONS.RENAME_CHAT: {
      const { chatId, newTitle } = action.payload
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat.id === chatId
            ? { ...chat, title: newTitle, updatedAt: new Date() }
            : chat
        ),
      }
    }

    case ACTIONS.SET_ACTIVE_CHAT:
      return {
        ...state,
        activeChatId: action.payload,
      }

    case ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      }

    case ACTIONS.TOGGLE_THEME:
      return {
        ...state,
        settings: {
          ...state.settings,
          theme: state.settings.theme === 'light' ? 'dark' : 'light',
        },
      }

    case ACTIONS.SET_SIDEBAR_OPEN:
      return {
        ...state,
        isSidebarOpen: action.payload,
      }

    case ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        isSidebarOpen: !state.isSidebarOpen,
      }

    case ACTIONS.SET_SETTINGS_PANEL_OPEN:
      return {
        ...state,
        isSettingsOpen: action.payload,
      }

    case ACTIONS.TOGGLE_SETTINGS_PANEL:
      return {
        ...state,
        isSettingsOpen: !state.isSettingsOpen,
      }

    case ACTIONS.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        chats: [],
        activeChatId: null,
      }

    default:
      return state
  }
}

// Custom hook
export const useAppState = () => {
  const [state, dispatch] = useReducer(appReducer, getInitialState(), (initial) => {
    const savedState = loadState()
    return savedState || initial
  })

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    saveState(state)
  }, [state])

  // Dispatch helpers for common actions
  const setAuthState = useCallback((isAuthenticated: boolean) => {
    dispatch({ type: ACTIONS.SET_AUTH_STATE, payload: isAuthenticated })
  }, [])

  const setAuthLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: ACTIONS.SET_AUTH_LOADING, payload: isLoading })
  }, [])

  const setAuthError = useCallback((error: string | null) => {
    dispatch({ type: ACTIONS.SET_AUTH_ERROR, payload: error })
  }, [])

  const setAuthKey = useCallback((authKey: string | null) => {
    dispatch({ type: ACTIONS.SET_AUTH_KEY, payload: authKey })
  }, [])

  const setUser = useCallback((user: User | null) => {
    dispatch({ type: ACTIONS.SET_USER, payload: user })
  }, [])

  const initializeAuthData = useCallback((user: User, chats: Chat[], authKey?: string) => {
    dispatch({ type: ACTIONS.INITIALIZE_AUTH_DATA, payload: { user, chats, authKey } })
    if (authKey) {
      setAuthKey(authKey)
    }
  }, [setAuthKey])

  const addMessage = useCallback((chatId: string, message: Message) => {
    dispatch({ type: ACTIONS.ADD_MESSAGE, payload: { chatId, message } })
  }, [])

  const updateMessage = useCallback((chatId: string, messageId: string, content: string) => {
    dispatch({ type: ACTIONS.UPDATE_MESSAGE, payload: { chatId, messageId, content } })
  }, [])

  const createChat = useCallback((chat: Chat) => {
    dispatch({ type: ACTIONS.CREATE_CHAT, payload: chat })
  }, [])

  const deleteChat = useCallback((chatId: string) => {
    dispatch({ type: ACTIONS.DELETE_CHAT, payload: chatId })
  }, [])

  const renameChat = useCallback((chatId: string, newTitle: string) => {
    dispatch({ type: ACTIONS.RENAME_CHAT, payload: { chatId, newTitle } })
  }, [])

  const setActiveChat = useCallback((chatId: string | null) => {
    dispatch({ type: ACTIONS.SET_ACTIVE_CHAT, payload: chatId })
  }, [])

  const updateSettings = useCallback((settings: Partial<Settings>) => {
    dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: settings })
  }, [])

  const toggleTheme = useCallback(() => {
    dispatch({ type: ACTIONS.TOGGLE_THEME })
  }, [])

  const setSidebarOpen = useCallback((isOpen: boolean) => {
    dispatch({ type: ACTIONS.SET_SIDEBAR_OPEN, payload: isOpen })
  }, [])

  const toggleSidebar = useCallback(() => {
    dispatch({ type: ACTIONS.TOGGLE_SIDEBAR })
  }, [])

  const setSettingsPanelOpen = useCallback((isOpen: boolean) => {
    dispatch({ type: ACTIONS.SET_SETTINGS_PANEL_OPEN, payload: isOpen })
  }, [])

  const toggleSettingsPanel = useCallback(() => {
    dispatch({ type: ACTIONS.TOGGLE_SETTINGS_PANEL })
  }, [])

  const logout = useCallback(() => {
    dispatch({ type: ACTIONS.LOGOUT })
  }, [])

  return {
    state,
    dispatch,
    setAuthState,
    setAuthLoading,
    setAuthError,
    setAuthKey,
    setUser,
    initializeAuthData,
    addMessage,
    updateMessage,
    createChat,
    deleteChat,
    renameChat,
    setActiveChat,
    updateSettings,
    toggleTheme,
    setSidebarOpen,
    toggleSidebar,
    setSettingsPanelOpen,
    toggleSettingsPanel,
    logout,
  }
}
