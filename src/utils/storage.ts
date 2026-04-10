import type { AppState } from '../hooks/useAppState'

const STORAGE_KEY = 'app_state_v1'

/**
 * Saves the app state to localStorage
 * Handles errors gracefully (quota exceeded, parse errors, etc.)
 */
export const saveState = (state: AppState): void => {
  try {
    const serialized = JSON.stringify(state)
    localStorage.setItem(STORAGE_KEY, serialized)
  } catch (error) {
    // Silently fail - storage might be unavailable or quota exceeded
    console.warn('Failed to save state to localStorage:', error)
  }
}

/**
 * Loads the app state from localStorage
 * Returns null if data is corrupted or unavailable
 */
export const loadState = (): AppState | null => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY)
    if (serialized === null) {
      return null
    }
    const state = JSON.parse(serialized)
    
    // Validate that the state has the expected structure
    if (
      typeof state === 'object' &&
      state !== null &&
      'isAuthenticated' in state &&
      'chats' in state &&
      'settings' in state
    ) {
      // Convert date strings back to Date objects if needed
      if (Array.isArray(state.chats)) {
        state.chats = state.chats.map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: Array.isArray(chat.messages)
            ? chat.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp),
              }))
            : [],
        }))
      }
      return state as AppState
    }
    return null
  } catch (error) {
    // Return null if localStorage is unavailable or data is corrupted
    console.warn('Failed to load state from localStorage:', error)
    return null
  }
}

/**
 * Clears the stored app state from localStorage
 * Useful for testing and logout functionality
 */
export const clearState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear state from localStorage:', error)
  }
}
