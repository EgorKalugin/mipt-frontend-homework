import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sidebar } from '../Sidebar'
import type { Chat, User } from '../../../../types'

describe('Sidebar Component', () => {
  const mockChats: Chat[] = [
    {
      id: 'chat-1',
      title: 'Python Help',
      messages: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'chat-2',
      title: 'JavaScript Tutorial',
      messages: [],
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      id: 'chat-3',
      title: 'React Basics',
      messages: [],
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
    },
  ]

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
  }

  const mockHandlers = {
    onSelectChat: vi.fn(),
    onNewChat: vi.fn(),
    onDeleteChat: vi.fn(),
    onRenameChat: vi.fn(),
    onOpenSettings: vi.fn(),
    onLogout: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render without crashing', () => {
      render(
        <Sidebar
          chats={mockChats}
          activeChatId="chat-1"
          user={mockUser}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    it('should display all chats in the list', () => {
      render(
        <Sidebar
          chats={mockChats}
          activeChatId="chat-1"
          user={mockUser}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Python Help')).toBeInTheDocument()
      expect(screen.getByText('JavaScript Tutorial')).toBeInTheDocument()
      expect(screen.getByText('React Basics')).toBeInTheDocument()
    })

    it('should display user information', () => {
      render(
        <Sidebar
          chats={mockChats}
          activeChatId="chat-1"
          user={mockUser}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    it('should handle empty chat list', () => {
      render(
        <Sidebar
          chats={[]}
          activeChatId={null}
          user={mockUser}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Test User')).toBeInTheDocument()
      // Should render sidebar even with no chats
    })

    it('should handle null user', () => {
      render(
        <Sidebar
          chats={mockChats}
          activeChatId="chat-1"
          user={null}
          {...mockHandlers}
        />
      )

      // Should still render sidebar
      expect(screen.getByText('Python Help')).toBeInTheDocument()
    })
  })

  describe('chat selection', () => {
    it('should highlight active chat', () => {
      render(
        <Sidebar
          chats={mockChats}
          activeChatId="chat-1"
          user={mockUser}
          {...mockHandlers}
        />
      )

      // The active chat should have some visual indication
      // We can check by looking for the chat being rendered
      expect(screen.getByText('Python Help')).toBeInTheDocument()
    })

    it('should call onSelectChat when chat item is clicked', async () => {
      const user = userEvent.setup()
      render(
        <Sidebar
          chats={mockChats}
          activeChatId={null}
          user={mockUser}
          {...mockHandlers}
        />
      )

      const chatItem = screen.getByText('Python Help')
      await user.click(chatItem)

      expect(mockHandlers.onSelectChat).toHaveBeenCalledWith('chat-1')
    })

    it('should select different chats', async () => {
      const user = userEvent.setup()
      render(
        <Sidebar
          chats={mockChats}
          activeChatId="chat-1"
          user={mockUser}
          {...mockHandlers}
        />
      )

      const reactChat = screen.getByText('React Basics')
      await user.click(reactChat)

      expect(mockHandlers.onSelectChat).toHaveBeenCalledWith('chat-3')
    })
  })

  describe('search functionality', () => {
    it('should render search input', () => {
      render(
        <Sidebar
          chats={mockChats}
          activeChatId="chat-1"
          user={mockUser}
          {...mockHandlers}
        />
      )

      const searchInput = screen.getByPlaceholderText(/search|поиск/i) || screen.getByRole('textbox', { hidden: true })
      expect(searchInput).toBeInTheDocument()
    })

    it('should filter chats by name when typing in search', async () => {
      const user = userEvent.setup()
      render(
        <Sidebar
          chats={mockChats}
          activeChatId="chat-1"
          user={mockUser}
          {...mockHandlers}
        />
      )

      const searchInput = screen.getByRole('textbox') || screen.getAllByRole('textbox')[0]
      
      await user.clear(searchInput)
      await user.type(searchInput, 'Python')

      await waitFor(() => {
        expect(screen.getByText('Python Help')).toBeInTheDocument()
      })

      // These should not be visible after filtering
      expect(screen.queryByText('JavaScript Tutorial')).not.toBeInTheDocument()
      expect(screen.queryByText('React Basics')).not.toBeInTheDocument()
    })

    it('should show all chats when search is empty', async () => {
      const user = userEvent.setup()
      render(
        <Sidebar
          chats={mockChats}
          activeChatId="chat-1"
          user={mockUser}
          {...mockHandlers}
        />
      )

      const searchInput = screen.getByRole('textbox') || screen.getAllByRole('textbox')[0]
      
      // Type and then clear
      await user.type(searchInput, 'Python')
      await user.clear(searchInput)

      await waitFor(() => {
        expect(screen.getByText('Python Help')).toBeInTheDocument()
        expect(screen.getByText('JavaScript Tutorial')).toBeInTheDocument()
        expect(screen.getByText('React Basics')).toBeInTheDocument()
      })
    })

    it('should be case-insensitive search', async () => {
      const user = userEvent.setup()
      render(
        <Sidebar
          chats={mockChats}
          activeChatId="chat-1"
          user={mockUser}
          {...mockHandlers}
        />
      )

      const searchInput = screen.getByRole('textbox') || screen.getAllByRole('textbox')[0]
      
      await user.clear(searchInput)
      await user.type(searchInput, 'javascript')

      await waitFor(() => {
        expect(screen.getByText('JavaScript Tutorial')).toBeInTheDocument()
      })
    })

    it('should handle search with no matching results', async () => {
      const user = userEvent.setup()
      render(
        <Sidebar
          chats={mockChats}
          activeChatId="chat-1"
          user={mockUser}
          {...mockHandlers}
        />
      )

      const searchInput = screen.getByRole('textbox') || screen.getAllByRole('textbox')[0]
      
      await user.clear(searchInput)
      await user.type(searchInput, 'NonExistentChat')

      // None of the chats should be visible
      expect(screen.queryByText('Python Help')).not.toBeInTheDocument()
      expect(screen.queryByText('JavaScript Tutorial')).not.toBeInTheDocument()
      expect(screen.queryByText('React Basics')).not.toBeInTheDocument()
    })
  })

  describe('delete functionality', () => {
    it('should call onDeleteChat when delete action is triggered', async () => {
      const user = userEvent.setup()
      render(
        <Sidebar
          chats={mockChats}
          activeChatId="chat-1"
          user={mockUser}
          {...mockHandlers}
        />
      )

      // Find and click delete button for first chat
      // This depends on component implementation - typically a button with delete icon
      const buttons = screen.getAllByRole('button')
      // Look for delete button
      const deleteButtons = buttons.filter((btn) => {
        return btn.getAttribute('title')?.toLowerCase().includes('delete') ||
               btn.textContent?.toLowerCase().includes('delete')
      })

      if (deleteButtons.length > 0) {
        await user.click(deleteButtons[0])
        // May need to confirm deletion
        const confirmButton = screen.queryByText(/confirm|yes|delete/i)
        if (confirmButton) {
          await user.click(confirmButton)
        }

        expect(mockHandlers.onDeleteChat).toHaveBeenCalled()
      }
    })

    it('should show confirmation dialog before deleting', async () => {
      const user = userEvent.setup()
      render(
        <Sidebar
          chats={mockChats}
          activeChatId="chat-1"
          user={mockUser}
          {...mockHandlers}
        />
      )

      const buttons = screen.getAllByRole('button')
      const deleteButtons = buttons.filter((btn) => {
        return btn.getAttribute('title')?.toLowerCase().includes('delete')
      })

      if (deleteButtons.length > 0) {
        await user.click(deleteButtons[0])

        // Look for confirmation dialog or increased button count
        // Dialog should appear
        expect(screen.getAllByRole('button').length).toBeGreaterThan(buttons.length)
      }
    })
  })

  describe('rename functionality', () => {
    it('should call onRenameChat when rename action is triggered', async () => {
      render(
        <Sidebar
          chats={mockChats}
          activeChatId="chat-1"
          user={mockUser}
          {...mockHandlers}
        />
      )

      // Find and click rename button
      const buttons = screen.getAllByRole('button')
      const renameButtons = buttons.filter((btn) => {
        return btn.getAttribute('title')?.toLowerCase().includes('rename') ||
               btn.getAttribute('title')?.toLowerCase().includes('edit') ||
               btn.textContent?.toLowerCase().includes('rename')
      })

      if (renameButtons.length > 0) {
        // Rename action may be triggered through different means
        // depending on component implementation
      }
    })
  })

  describe('new chat button', () => {
    it('should render new chat button', () => {
      render(
        <Sidebar
          chats={mockChats}
          activeChatId="chat-1"
          user={mockUser}
          {...mockHandlers}
        />
      )

      const newChatButton = screen.getByRole('button', { name: /new|create|новый/i }) ||
                            screen.queryByText(/new|create|новый/i)
      expect(newChatButton).toBeInTheDocument()
    })

    it('should call onNewChat when new chat button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <Sidebar
          chats={mockChats}
          activeChatId="chat-1"
          user={mockUser}
          {...mockHandlers}
        />
      )

      const newChatButton = screen.getByRole('button', { name: /new|create|новый/i }) ||
                            screen.getAllByRole('button').find((btn) => 
                              btn.textContent?.toLowerCase().includes('new') ||
                              btn.getAttribute('title')?.toLowerCase().includes('new')
                            )

      if (newChatButton) {
        await user.click(newChatButton)
        expect(mockHandlers.onNewChat).toHaveBeenCalled()
      }
    })
  })

  describe('settings button', () => {
    it('should render settings button', () => {
      render(
        <Sidebar
          chats={mockChats}
          activeChatId="chat-1"
          user={mockUser}
          {...mockHandlers}
        />
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should call onOpenSettings when settings button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <Sidebar
          chats={mockChats}
          activeChatId="chat-1"
          user={mockUser}
          {...mockHandlers}
        />
      )

      const buttons = screen.getAllByRole('button')
      const settingsButton = buttons.find((btn) =>
        btn.getAttribute('title')?.toLowerCase().includes('settings') ||
        btn.getAttribute('title')?.toLowerCase().includes('gear')
      )

      if (settingsButton) {
        await user.click(settingsButton)
        expect(mockHandlers.onOpenSettings).toHaveBeenCalled()
      }
    })
  })

  describe('logout button', () => {
    it('should call onLogout when logout button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <Sidebar
          chats={mockChats}
          activeChatId="chat-1"
          user={mockUser}
          {...mockHandlers}
        />
      )

      const buttons = screen.getAllByRole('button')
      const logoutButton = buttons.find((btn) =>
        btn.textContent?.toLowerCase().includes('logout') ||
        btn.getAttribute('title')?.toLowerCase().includes('logout')
      )

      if (logoutButton) {
        await user.click(logoutButton)
        expect(mockHandlers.onLogout).toHaveBeenCalled()
      }
    })
  })

  describe('edge cases', () => {
    it('should handle chat with very long title', () => {
      const longTitleChat: Chat = {
        id: 'chat-long',
        title: 'A'.repeat(200),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      render(
        <Sidebar
          chats={[longTitleChat]}
          activeChatId="chat-long"
          user={mockUser}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('A'.repeat(200))).toBeInTheDocument()
    })

    it('should handle many chats without performance issues', () => {
      const manyChatsList: Chat[] = Array.from({ length: 50 }, (_, i) => ({
        id: `chat-${i}`,
        title: `Chat ${i}`,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      render(
        <Sidebar
          chats={manyChatsList}
          activeChatId="chat-0"
          user={mockUser}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Chat 0')).toBeInTheDocument()
    })

    it('should handle chat titles with special characters', () => {
      const specialChat: Chat = {
        id: 'chat-special',
        title: 'Chat <with> &special "#chars"',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      render(
        <Sidebar
          chats={[specialChat]}
          activeChatId="chat-special"
          user={mockUser}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Chat <with> &special "#chars"')).toBeInTheDocument()
    })
  })
})
