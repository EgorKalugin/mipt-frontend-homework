import { describe, it, expect, beforeEach } from 'vitest'
import { saveState, loadState, clearState } from '../storage'
import type { AppState } from '../../hooks/useAppState'
import { mockSettings } from '../../data/mockData'

const createMockAppState = (): AppState => ({
  isAuthenticated: true,
  authLoading: false,
  authError: null,
  authKey: null,
  user: {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
  },
  chats: [
    {
      id: 'chat-1',
      title: 'Test Chat',
      messages: [
        {
          id: 'msg-1',
          role: 'user' as const,
          content: 'Hello',
          timestamp: new Date('2024-01-01'),
        },
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ],
  activeChatId: 'chat-1',
  settings: mockSettings,
  isSidebarOpen: false,
  isSettingsOpen: false,
})

describe('localStorage persistence', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('saveState', () => {
    it('should save state to localStorage', () => {
      const state = createMockAppState()

      saveState(state)

      const stored = localStorage.getItem('app_state_v1')
      expect(stored).not.toBeNull()
      expect(typeof stored).toBe('string')
    })

    it('should handle null user gracefully', () => {
      const state = createMockAppState()
      state.user = null

      saveState(state)

      const stored = localStorage.getItem('app_state_v1')
      expect(stored).not.toBeNull()
    })

    it('should handle empty chats array', () => {
      const state = createMockAppState()
      state.chats = []

      saveState(state)

      const stored = localStorage.getItem('app_state_v1')
      expect(stored).not.toBeNull()
    })

    it('should save complex state with messages', () => {
      const state = createMockAppState()
      state.chats[0].messages = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'User message',
          timestamp: new Date(),
        },
        {
          id: 'msg-2',
          role: 'assistant',
          content: 'Assistant response',
          timestamp: new Date(),
        },
      ]

      saveState(state)

      const stored = localStorage.getItem('app_state_v1')
      const parsed = JSON.parse(stored!)
      expect(parsed.chats[0].messages).toHaveLength(2)
    })
  })

  describe('loadState', () => {
    it('should return null when no state is saved', () => {
      const result = loadState()

      expect(result).toBeNull()
    })

    it('should load saved state from localStorage', () => {
      const state = createMockAppState()
      saveState(state)

      const loaded = loadState()

      expect(loaded).not.toBeNull()
      expect(loaded?.isAuthenticated).toBe(state.isAuthenticated)
      expect(loaded?.user?.id).toBe(state.user?.id)
    })

    it('should convert date strings back to Date objects for chats', () => {
      const state = createMockAppState()
      saveState(state)

      const loaded = loadState()

      expect(loaded?.chats[0].createdAt).toBeInstanceOf(Date)
      expect(loaded?.chats[0].updatedAt).toBeInstanceOf(Date)
    })

    it('should convert date strings back to Date objects for messages', () => {
      const state = createMockAppState()
      saveState(state)

      const loaded = loadState()

      expect(loaded?.chats[0].messages[0].timestamp).toBeInstanceOf(Date)
    })

    it('should preserve chat structure after load', () => {
      const state = createMockAppState()
      const originalChat = state.chats[0]
      saveState(state)

      const loaded = loadState()
      const loadedChat = loaded?.chats[0]

      expect(loadedChat?.id).toBe(originalChat.id)
      expect(loadedChat?.title).toBe(originalChat.title)
      expect(loadedChat?.messages).toHaveLength(originalChat.messages.length)
    })

    it('should preserve settings after load', () => {
      const state = createMockAppState()
      saveState(state)

      const loaded = loadState()

      expect(loaded?.settings.theme).toBe(state.settings.theme)
      expect(loaded?.settings.temperature).toBe(state.settings.temperature)
      expect(loaded?.settings.maxTokens).toBe(state.settings.maxTokens)
    })
  })

  describe('clearState', () => {
    it('should remove state from localStorage', () => {
      const state = createMockAppState()
      saveState(state)
      expect(localStorage.getItem('app_state_v1')).not.toBeNull()

      clearState()

      expect(localStorage.getItem('app_state_v1')).toBeNull()
    })

    it('should handle clearing when no state exists', () => {
      expect(() => {
        clearState()
      }).not.toThrow()
    })
  })

  describe('corrupted or invalid data', () => {
    it('should return null for invalid JSON', () => {
      localStorage.setItem('app_state_v1', 'invalid json {')

      const result = loadState()

      expect(result).toBeNull()
    })

    it('should return null if savedstate is missing required fields', () => {
      localStorage.setItem('app_state_v1', JSON.stringify({ some: 'data' }))

      const result = loadState()

      expect(result).toBeNull()
    })

    it('should handle missing chats field', () => {
      localStorage.setItem(
        'app_state_v1',
        JSON.stringify({
          isAuthenticated: true,
          settings: mockSettings,
        })
      )

      const result = loadState()

      expect(result).toBeNull()
    })

    it('should handle missing settings field', () => {
      localStorage.setItem(
        'app_state_v1',
        JSON.stringify({
          isAuthenticated: true,
          chats: [],
        })
      )

      const result = loadState()

      expect(result).toBeNull()
    })

    it('should gracefully handle null stored value', () => {
      localStorage.setItem('app_state_v1', 'null')

      const result = loadState()

      expect(result).toBeNull()
    })

    it('should handle malformed message timestamps', () => {
      const state = createMockAppState()
      saveState(state)

      // Manually corrupt the stored data
      const stored = localStorage.getItem('app_state_v1')!
      const parsed = JSON.parse(stored)
      parsed.chats[0].messages[0].timestamp = 'invalid-date'
      localStorage.setItem('app_state_v1', JSON.stringify(parsed))

      const result = loadState()

      // Should still load but with invalid date
      expect(result).not.toBeNull()
      expect(result?.chats[0].messages[0].timestamp).toBeInstanceOf(Date)
    })
  })

  describe('round-trip persistence', () => {
    it('should maintain state integrity after save and load', () => {
      const originalState = createMockAppState()
      originalState.isAuthenticated = true
      originalState.activeChatId = 'chat-1'

      saveState(originalState)
      const loadedState = loadState()

      expect(loadedState?.isAuthenticated).toBe(originalState.isAuthenticated)
      expect(loadedState?.activeChatId).toBe(originalState.activeChatId)
      expect(loadedState?.user?.email).toBe(originalState.user?.email)
    })

    it('should handle multiple saves and loads', () => {
      const state1 = createMockAppState()
      saveState(state1)

      const loaded1 = loadState()
      expect(loaded1?.activeChatId).toBe('chat-1')

      // Modify and save again
      const state2 = { ...loaded1!, activeChatId: 'chat-2' }
      saveState(state2)

      const loaded2 = loadState()
      expect(loaded2?.activeChatId).toBe('chat-2')
    })

    it('should preserve empty authentication state', () => {
      const emptyState: AppState = {
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

      saveState(emptyState)
      const loaded = loadState()

      expect(loaded?.isAuthenticated).toBe(false)
      expect(loaded?.user).toBeNull()
      expect(loaded?.chats).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    it('should handle state with very long chat titles', () => {
      const state = createMockAppState()
      state.chats[0].title = 'A'.repeat(10000)

      saveState(state)
      const loaded = loadState()

      expect(loaded?.chats[0].title).toHaveLength(10000)
    })

    it('should handle state with many chats', () => {
      const state = createMockAppState()
      state.chats = Array.from({ length: 100 }, (_, i) => ({
        id: `chat-${i}`,
        title: `Chat ${i}`,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      saveState(state)
      const loaded = loadState()

      expect(loaded?.chats).toHaveLength(100)
    })

    it('should handle state with many messages', () => {
      const state = createMockAppState()
      state.chats[0].messages = Array.from({ length: 50 }, (_, i) => ({
        id: `msg-${i}`,
        role: i % 2 === 0 ? ('user' as const) : ('assistant' as const),
        content: `Message ${i}`,
        timestamp: new Date(),
      }))

      saveState(state)
      const loaded = loadState()

      expect(loaded?.chats[0].messages).toHaveLength(50)
    })
  })
})
