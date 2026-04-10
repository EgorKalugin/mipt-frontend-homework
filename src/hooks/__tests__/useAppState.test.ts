import { describe, it, expect } from 'vitest'
import { appReducer, getInitialState, ACTIONS } from '../useAppState'
import type { Chat, Message } from '../../types'

describe('appReducer', () => {
  describe('ADD_MESSAGE', () => {
    it('should add a message to the specified chat', () => {
      const initialState = getInitialState()
      const chatId = 'chat-1'
      const chat: Chat = {
        id: chatId,
        title: 'Test Chat',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      initialState.chats = [chat]

      const newMessage: Message = {
        id: 'msg-1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date(),
      }

      const state = appReducer(initialState, {
        type: ACTIONS.ADD_MESSAGE,
        payload: { chatId, message: newMessage },
      })

      expect(state.chats[0].messages).toHaveLength(1)
      expect(state.chats[0].messages[0]).toEqual(newMessage)
    })

    it('should append message to end of chat messages', () => {
      const initialState = getInitialState()
      const chatId = 'chat-1'
      const existingMessage: Message = {
        id: 'msg-0',
        role: 'user',
        content: 'First',
        timestamp: new Date(),
      }
      const chat: Chat = {
        id: chatId,
        title: 'Test Chat',
        messages: [existingMessage],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      initialState.chats = [chat]

      const newMessage: Message = {
        id: 'msg-1',
        role: 'assistant',
        content: 'Second',
        timestamp: new Date(),
      }

      const state = appReducer(initialState, {
        type: ACTIONS.ADD_MESSAGE,
        payload: { chatId, message: newMessage },
      })

      expect(state.chats[0].messages).toHaveLength(2)
      expect(state.chats[0].messages[0].id).toBe('msg-0')
      expect(state.chats[0].messages[1].id).toBe('msg-1')
    })

    it('should not affect other chats', () => {
      const initialState = getInitialState()
      const chat1: Chat = {
        id: 'chat-1',
        title: 'Chat 1',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const chat2: Chat = {
        id: 'chat-2',
        title: 'Chat 2',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      initialState.chats = [chat1, chat2]

      const newMessage: Message = {
        id: 'msg-1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date(),
      }

      const state = appReducer(initialState, {
        type: ACTIONS.ADD_MESSAGE,
        payload: { chatId: 'chat-1', message: newMessage },
      })

      expect(state.chats[0].messages).toHaveLength(1)
      expect(state.chats[1].messages).toHaveLength(0)
    })

    it('should update chat updatedAt timestamp', () => {
      const initialState = getInitialState()
      const oldDate = new Date('2024-01-01')
      const chat: Chat = {
        id: 'chat-1',
        title: 'Test Chat',
        messages: [],
        createdAt: oldDate,
        updatedAt: oldDate,
      }
      initialState.chats = [chat]

      const newMessage: Message = {
        id: 'msg-1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date(),
      }

      const state = appReducer(initialState, {
        type: ACTIONS.ADD_MESSAGE,
        payload: { chatId: 'chat-1', message: newMessage },
      })

      expect(state.chats[0].updatedAt.getTime()).toBeGreaterThan(oldDate.getTime())
    })
  })

  describe('CREATE_CHAT', () => {
    it('should add new chat to the beginning of chats array', () => {
      const initialState = getInitialState()
      const existingChat: Chat = {
        id: 'chat-1',
        title: 'Existing Chat',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      initialState.chats = [existingChat]

      const newChat: Chat = {
        id: 'chat-2',
        title: 'New Chat',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const state = appReducer(initialState, {
        type: ACTIONS.CREATE_CHAT,
        payload: newChat,
      })

      expect(state.chats).toHaveLength(2)
      expect(state.chats[0].id).toBe('chat-2')
      expect(state.chats[1].id).toBe('chat-1')
    })

    it('should generate unique chat IDs', () => {
      const initialState = getInitialState()
      const chat1: Chat = {
        id: `chat-${Date.now()}`,
        title: 'Chat 1',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      initialState.chats = [chat1]

      const chat2: Chat = {
        id: `chat-${Date.now() + 1}`,
        title: 'Chat 2',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const state = appReducer(initialState, {
        type: ACTIONS.CREATE_CHAT,
        payload: chat2,
      })

      const ids = state.chats.map((c) => c.id)
      expect(new Set(ids).size).toBe(2)
    })

    it('should set new chat as activeChatId', () => {
      const initialState = getInitialState()

      const newChat: Chat = {
        id: 'chat-1',
        title: 'New Chat',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const state = appReducer(initialState, {
        type: ACTIONS.CREATE_CHAT,
        payload: newChat,
      })

      expect(state.activeChatId).toBe('chat-1')
    })

    it('should replace previous activeChatId with new chat', () => {
      const initialState = getInitialState()
      initialState.activeChatId = 'chat-1'

      const newChat: Chat = {
        id: 'chat-2',
        title: 'New Chat',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const state = appReducer(initialState, {
        type: ACTIONS.CREATE_CHAT,
        payload: newChat,
      })

      expect(state.activeChatId).toBe('chat-2')
    })
  })

  describe('DELETE_CHAT', () => {
    it('should remove chat from chats array', () => {
      const initialState = getInitialState()
      const chat1: Chat = {
        id: 'chat-1',
        title: 'Chat 1',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const chat2: Chat = {
        id: 'chat-2',
        title: 'Chat 2',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      initialState.chats = [chat1, chat2]

      const state = appReducer(initialState, {
        type: ACTIONS.DELETE_CHAT,
        payload: 'chat-1',
      })

      expect(state.chats).toHaveLength(1)
      expect(state.chats[0].id).toBe('chat-2')
    })

    it('should clear activeChatId if deleted chat was active', () => {
      const initialState = getInitialState()
      const chat: Chat = {
        id: 'chat-1',
        title: 'Chat 1',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      initialState.chats = [chat]
      initialState.activeChatId = 'chat-1'

      const state = appReducer(initialState, {
        type: ACTIONS.DELETE_CHAT,
        payload: 'chat-1',
      })

      expect(state.activeChatId).toBeNull()
    })

    it('should set next available chat as active if deleted chat was active', () => {
      const initialState = getInitialState()
      const chat1: Chat = {
        id: 'chat-1',
        title: 'Chat 1',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const chat2: Chat = {
        id: 'chat-2',
        title: 'Chat 2',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      initialState.chats = [chat1, chat2]
      initialState.activeChatId = 'chat-1'

      const state = appReducer(initialState, {
        type: ACTIONS.DELETE_CHAT,
        payload: 'chat-1',
      })

      expect(state.activeChatId).toBe('chat-2')
    })

    it('should not affect activeChatId if deleted chat was not active', () => {
      const initialState = getInitialState()
      const chat1: Chat = {
        id: 'chat-1',
        title: 'Chat 1',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const chat2: Chat = {
        id: 'chat-2',
        title: 'Chat 2',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      initialState.chats = [chat1, chat2]
      initialState.activeChatId = 'chat-2'

      const state = appReducer(initialState, {
        type: ACTIONS.DELETE_CHAT,
        payload: 'chat-1',
      })

      expect(state.activeChatId).toBe('chat-2')
    })
  })

  describe('RENAME_CHAT', () => {
    it('should update chat title by id', () => {
      const initialState = getInitialState()
      const chat: Chat = {
        id: 'chat-1',
        title: 'Old Title',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      initialState.chats = [chat]

      const state = appReducer(initialState, {
        type: ACTIONS.RENAME_CHAT,
        payload: { chatId: 'chat-1', newTitle: 'New Title' },
      })

      expect(state.chats[0].title).toBe('New Title')
    })

    it('should not affect other chats', () => {
      const initialState = getInitialState()
      const chat1: Chat = {
        id: 'chat-1',
        title: 'Chat 1',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const chat2: Chat = {
        id: 'chat-2',
        title: 'Chat 2',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      initialState.chats = [chat1, chat2]

      const state = appReducer(initialState, {
        type: ACTIONS.RENAME_CHAT,
        payload: { chatId: 'chat-1', newTitle: 'Updated Chat 1' },
      })

      expect(state.chats[0].title).toBe('Updated Chat 1')
      expect(state.chats[1].title).toBe('Chat 2')
    })

    it('should update chat updatedAt timestamp', () => {
      const initialState = getInitialState()
      const oldDate = new Date('2024-01-01')
      const chat: Chat = {
        id: 'chat-1',
        title: 'Chat 1',
        messages: [],
        createdAt: oldDate,
        updatedAt: oldDate,
      }
      initialState.chats = [chat]

      const state = appReducer(initialState, {
        type: ACTIONS.RENAME_CHAT,
        payload: { chatId: 'chat-1', newTitle: 'New Title' },
      })

      expect(state.chats[0].updatedAt.getTime()).toBeGreaterThan(oldDate.getTime())
    })

    it('should preserve messages when renaming', () => {
      const initialState = getInitialState()
      const message: Message = {
        id: 'msg-1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date(),
      }
      const chat: Chat = {
        id: 'chat-1',
        title: 'Old Title',
        messages: [message],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      initialState.chats = [chat]

      const state = appReducer(initialState, {
        type: ACTIONS.RENAME_CHAT,
        payload: { chatId: 'chat-1', newTitle: 'New Title' },
      })

      expect(state.chats[0].messages).toEqual([message])
    })
  })

  describe('SET_ACTIVE_CHAT', () => {
    it('should update activeChatId', () => {
      const initialState = getInitialState()

      const state = appReducer(initialState, {
        type: ACTIONS.SET_ACTIVE_CHAT,
        payload: 'chat-1',
      })

      expect(state.activeChatId).toBe('chat-1')
    })

    it('should allow setting activeChatId to null', () => {
      const initialState = getInitialState()
      initialState.activeChatId = 'chat-1'

      const state = appReducer(initialState, {
        type: ACTIONS.SET_ACTIVE_CHAT,
        payload: null,
      })

      expect(state.activeChatId).toBeNull()
    })
  })

  describe('UPDATE_SETTINGS', () => {
    it('should merge new settings with existing settings', () => {
      const initialState = getInitialState()

      const state = appReducer(initialState, {
        type: ACTIONS.UPDATE_SETTINGS,
        payload: { temperature: 0.5 },
      })

      expect(state.settings.temperature).toBe(0.5)
      expect(state.settings.theme).toBe(initialState.settings.theme)
    })

    it('should update multiple settings at once', () => {
      const initialState = getInitialState()

      const state = appReducer(initialState, {
        type: ACTIONS.UPDATE_SETTINGS,
        payload: { temperature: 0.5, maxTokens: 2048 },
      })

      expect(state.settings.temperature).toBe(0.5)
      expect(state.settings.maxTokens).toBe(2048)
      expect(state.settings.theme).toBe(initialState.settings.theme)
    })
  })

  describe('TOGGLE_THEME', () => {
    it('should toggle theme from light to dark', () => {
      const initialState = getInitialState()
      initialState.settings.theme = 'light'

      const state = appReducer(initialState, {
        type: ACTIONS.TOGGLE_THEME,
      })

      expect(state.settings.theme).toBe('dark')
    })

    it('should toggle theme from dark to light', () => {
      const initialState = getInitialState()
      initialState.settings.theme = 'dark'

      const state = appReducer(initialState, {
        type: ACTIONS.TOGGLE_THEME,
      })

      expect(state.settings.theme).toBe('light')
    })
  })

  describe('SET_SIDEBAR_OPEN', () => {
    it('should set sidebar open state', () => {
      const initialState = getInitialState()

      const state = appReducer(initialState, {
        type: ACTIONS.SET_SIDEBAR_OPEN,
        payload: true,
      })

      expect(state.isSidebarOpen).toBe(true)
    })

    it('should set sidebar closed state', () => {
      const initialState = getInitialState()
      initialState.isSidebarOpen = true

      const state = appReducer(initialState, {
        type: ACTIONS.SET_SIDEBAR_OPEN,
        payload: false,
      })

      expect(state.isSidebarOpen).toBe(false)
    })
  })

  describe('TOGGLE_SIDEBAR', () => {
    it('should toggle sidebar from open to closed', () => {
      const initialState = getInitialState()
      initialState.isSidebarOpen = true

      const state = appReducer(initialState, {
        type: ACTIONS.TOGGLE_SIDEBAR,
      })

      expect(state.isSidebarOpen).toBe(false)
    })

    it('should toggle sidebar from closed to open', () => {
      const initialState = getInitialState()
      initialState.isSidebarOpen = false

      const state = appReducer(initialState, {
        type: ACTIONS.TOGGLE_SIDEBAR,
      })

      expect(state.isSidebarOpen).toBe(true)
    })
  })

  describe('SET_SETTINGS_PANEL_OPEN', () => {
    it('should set settings panel open state', () => {
      const initialState = getInitialState()

      const state = appReducer(initialState, {
        type: ACTIONS.SET_SETTINGS_PANEL_OPEN,
        payload: true,
      })

      expect(state.isSettingsOpen).toBe(true)
    })

    it('should set settings panel closed state', () => {
      const initialState = getInitialState()
      initialState.isSettingsOpen = true

      const state = appReducer(initialState, {
        type: ACTIONS.SET_SETTINGS_PANEL_OPEN,
        payload: false,
      })

      expect(state.isSettingsOpen).toBe(false)
    })
  })

  describe('TOGGLE_SETTINGS_PANEL', () => {
    it('should toggle settings panel from open to closed', () => {
      const initialState = getInitialState()
      initialState.isSettingsOpen = true

      const state = appReducer(initialState, {
        type: ACTIONS.TOGGLE_SETTINGS_PANEL,
      })

      expect(state.isSettingsOpen).toBe(false)
    })

    it('should toggle settings panel from closed to open', () => {
      const initialState = getInitialState()
      initialState.isSettingsOpen = false

      const state = appReducer(initialState, {
        type: ACTIONS.TOGGLE_SETTINGS_PANEL,
      })

      expect(state.isSettingsOpen).toBe(true)
    })
  })

  describe('LOGOUT', () => {
    it('should clear authentication state', () => {
      const initialState = getInitialState()
      initialState.isAuthenticated = true
      initialState.user = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
      }

      const state = appReducer(initialState, {
        type: ACTIONS.LOGOUT,
      })

      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
    })

    it('should clear chats and activeChatId', () => {
      const initialState = getInitialState()
      const chat: Chat = {
        id: 'chat-1',
        title: 'Chat',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      initialState.chats = [chat]
      initialState.activeChatId = 'chat-1'

      const state = appReducer(initialState, {
        type: ACTIONS.LOGOUT,
      })

      expect(state.chats).toHaveLength(0)
      expect(state.activeChatId).toBeNull()
    })

    it('should preserve settings on logout', () => {
      const initialState = getInitialState()
      const originalSettings = { ...initialState.settings }

      const state = appReducer(initialState, {
        type: ACTIONS.LOGOUT,
      })

      expect(state.settings).toEqual(originalSettings)
    })
  })

  describe('INITIALIZE_AUTH_DATA', () => {
    it('should set user and chats from payload', () => {
      const initialState = getInitialState()
      const user = { id: 'user-1', email: 'test@example.com', name: 'Test User' }
      const chat: Chat = {
        id: 'chat-1',
        title: 'Chat 1',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const state = appReducer(initialState, {
        type: ACTIONS.INITIALIZE_AUTH_DATA,
        payload: { user, chats: [chat] },
      })

      expect(state.user).toEqual(user)
      expect(state.chats).toEqual([chat])
    })

    it('should set first chat as active', () => {
      const initialState = getInitialState()
      const user = { id: 'user-1', email: 'test@example.com', name: 'Test User' }
      const chat1: Chat = {
        id: 'chat-1',
        title: 'Chat 1',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const chat2: Chat = {
        id: 'chat-2',
        title: 'Chat 2',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const state = appReducer(initialState, {
        type: ACTIONS.INITIALIZE_AUTH_DATA,
        payload: { user, chats: [chat1, chat2] },
      })

      expect(state.activeChatId).toBe('chat-1')
    })

    it('should set authenticated to true', () => {
      const initialState = getInitialState()
      const user = { id: 'user-1', email: 'test@example.com', name: 'Test User' }

      const state = appReducer(initialState, {
        type: ACTIONS.INITIALIZE_AUTH_DATA,
        payload: { user, chats: [] },
      })

      expect(state.isAuthenticated).toBe(true)
    })

    it('should handle empty chats array', () => {
      const initialState = getInitialState()
      const user = { id: 'user-1', email: 'test@example.com', name: 'Test User' }

      const state = appReducer(initialState, {
        type: ACTIONS.INITIALIZE_AUTH_DATA,
        payload: { user, chats: [] },
      })

      expect(state.activeChatId).toBeNull()
      expect(state.chats).toHaveLength(0)
    })
  })

  describe('Unknown action', () => {
    it('should return state unchanged for unknown action type', () => {
      const initialState = getInitialState()

      const state = appReducer(initialState, {
        type: 'UNKNOWN_ACTION' as any,
      })

      expect(state).toEqual(initialState)
    })
  })

  describe('Initial state', () => {
    it('should return initial state with empty chats', () => {
      const state = getInitialState()

      expect(state.chats).toEqual([])
      expect(state.activeChatId).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })

    it('should have default settings', () => {
      const state = getInitialState()

      expect(state.settings).toBeDefined()
      expect(state.settings.theme).toBeDefined()
      expect(state.settings.model).toBeDefined()
    })
  })
})
