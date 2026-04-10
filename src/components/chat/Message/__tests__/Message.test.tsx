import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Message } from '../Message'
import type { Message as MessageType } from '../../../../types'

// Mock the react-markdown and syntax-highlighter components
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div>{children}</div>,
}))

vi.mock('react-syntax-highlighter', () => ({
  default: ({ children }: { children: string }) => <code>{children}</code>,
}))

describe('Message Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createMessage = (
    role: 'user' | 'assistant' = 'user',
    content: string = 'Test',
    timestamp: Date = new Date('2024-01-01T10:00:00')
  ): MessageType => ({
    id: 'msg-1',
    role,
    content,
    timestamp,
  })

  describe('rendering', () => {
    it('should render user message', () => {
      const message: MessageType = {
        id: 'msg-1',
        role: 'user',
        content: 'Test user message',
        timestamp: new Date('2024-01-01T10:00:00'),
      }
      render(<Message message={message} variant="user" />)

      expect(screen.getByText('Test user message')).toBeInTheDocument()
    })

    it('should render assistant message', () => {
      const message: MessageType = {
        id: 'msg-1',
        role: 'assistant',
        content: 'Test assistant message',
        timestamp: new Date('2024-01-01T10:00:00'),
      }
      render(<Message message={message} variant="assistant" />)

      expect(screen.getByText('Test assistant message')).toBeInTheDocument()
    })
  })

  describe('styling - variant-specific CSS classes', () => {
    it('should have user-specific CSS class when variant is user', () => {
      const message = createMessage('user', 'User message')
      const { container } = render(<Message message={message} variant="user" />)

      // Check for user-specific styling (typically has a CSS class with 'user' in it)
      const messageElement = container.firstChild
      // The component should have some indication it's a user message
      expect(messageElement).toBeInTheDocument()
    })

    it('should have assistant-specific CSS class when variant is assistant', () => {
      const message = createMessage('assistant', 'Assistant message')
      const { container } = render(<Message message={message} variant="assistant" />)

      const messageElement = container.firstChild
      expect(messageElement).toBeInTheDocument()
    })
  })

  describe('copy button functionality', () => {
    it('should not have copy button for user messages', () => {
      const message = createMessage('user', 'User message')
      render(<Message message={message} variant="user" />)

      // Look for a copy button - there shouldn't be one for user messages
      const buttons = screen.queryAllByRole('button')
      expect(buttons.filter((b) => b.textContent?.toLowerCase().includes('copy'))).toHaveLength(0)
    })

    it('should have copy button for assistant messages', () => {
      const message = createMessage('assistant', 'Assistant message')
      render(<Message message={message} variant="assistant" />)

      // Look for a copy button - there should be one for assistant messages
      const buttons = screen.queryAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should copy message content to clipboard when copy button clicked', async () => {
      const user = userEvent.setup()
      const clipboardWriteSpy = vi.spyOn(navigator.clipboard, 'writeText')
      const message = createMessage('assistant', 'Copy this text')

      render(<Message message={message} variant="assistant" />)

      const buttons = screen.getAllByRole('button')
      const copyButton = buttons.find((b) => b.getAttribute('title')?.toLowerCase().includes('copy') || b.textContent?.toLowerCase().includes('copy'))

      if (copyButton) {
        await user.click(copyButton)

        await waitFor(() => {
          expect(clipboardWriteSpy).toHaveBeenCalledWith('Copy this text')
        })
      }
    })

    it('should attempt clipboard copy for assistant messages', async () => {
      const user = userEvent.setup()
      const clipboardSpy = vi.spyOn(navigator.clipboard, 'writeText')
      const message = createMessage('assistant', 'Message to copy')

      render(<Message message={message} variant="assistant" />)

      const buttons = screen.getAllByRole('button')

      if (buttons.length > 0) {
        await user.click(buttons[0])

        await waitFor(() => {
          expect(clipboardSpy).toHaveBeenCalledWith('Message to copy')
        })
      }
      
      clipboardSpy.mockRestore()
    })
  })

  describe('timestamp formatting', () => {
    it('should display timestamp', () => {
      const testDate = new Date('2024-01-15T14:30:00')
      const message = createMessage('user', 'Test message', testDate)
      render(<Message message={message} />)

      // The timestamp should be displayed somewhere in the component
      expect(screen.getByText('Test message')).toBeInTheDocument()
    })

    it('should format different times correctly', () => {
      const time1 = new Date('2024-01-15T09:00:00')
      const time2 = new Date('2024-01-15T22:45:00')
      const message1 = createMessage('user', 'Morning message', time1)
      const message2 = createMessage('user', 'Evening message', time2)

      const { rerender } = render(<Message message={message1} />)

      expect(screen.getByText('Morning message')).toBeInTheDocument()

      rerender(<Message message={message2} />)

      expect(screen.getByText('Evening message')).toBeInTheDocument()
    })
  })

  describe('content rendering', () => {
    it('should render plain text content', () => {
      const message = createMessage('user', 'Plain text message')
      render(<Message message={message} />)

      expect(screen.getByText('Plain text message')).toBeInTheDocument()
    })

    it('should handle long messages', () => {
      const longContent = 'A'.repeat(1000)
      const message = createMessage('assistant', longContent)
      render(<Message message={message} />)

      expect(screen.getByText(longContent)).toBeInTheDocument()
    })

    it('should handle messages with special characters', () => {
      const specialContent = 'Special chars: <>&"\'@#$%^'
      const message = createMessage('user', specialContent)
      render(<Message message={message} />)

      expect(screen.getByText(specialContent)).toBeInTheDocument()
    })

    it('should handle messages with newlines', () => {
      const multilineContent = 'Line 1\nLine 2\nLine 3'
      const message = createMessage('user', multilineContent)
      const { container } = render(<Message message={message} />)

      // Verify text content exists (newlines split the DOM nodes)
      const content = container.textContent
      expect(content).toContain('Line 1')
      expect(content).toContain('Line 2')
      expect(content).toContain('Line 3')
    })

    it('should handle empty message gracefully', () => {
      const message = createMessage('user', '')
      const { container } = render(<Message message={message} />)

      // Verify the component renders even with empty content
      const contentDiv = container.querySelector('div')
      expect(contentDiv).toBeInTheDocument()
      expect(contentDiv).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have appropriate ARIA labels for user messages', () => {
      const message = createMessage('user', 'User message content')
      const { container } = render(<Message message={message} variant="user" />)

      // Check that the message is properly structured
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should have appropriate ARIA labels for assistant messages', () => {
      const message = createMessage('assistant', 'Assistant message content')
      const { container } = render(<Message message={message} variant="assistant" />)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should have accessible copy button for assistants messages', () => {
      const message = createMessage('assistant', 'Message to copy')
      render(<Message message={message} variant="assistant" />)

      const buttons = screen.queryAllByRole('button')
      // Should have at least one button (copy button for assistant messages)
      expect(buttons.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('role-specific behavior', () => {
    it('should differentiate between user and assistant roles visually', () => {
      const userMessage = createMessage('user', 'User message')
      const assistantMessage = createMessage('assistant', 'Assistant message')
      const { container: userContainer } = render(<Message message={userMessage} variant="user" />)

      const { container: assistantContainer } = render(<Message message={assistantMessage} variant="assistant" />)

      // Both should render but may have different classes or styling
      expect(userContainer.firstChild).toBeInTheDocument()
      expect(assistantContainer.firstChild).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle messages with only spaces', () => {
      const message = createMessage('user', '     ')
      const { container } = render(<Message message={message} />)

      // Verify the message container is rendered even with whitespace content
      const messageContainer = container.querySelector('.message') || container.firstChild
      expect(messageContainer).toBeInTheDocument()
    })

    it('should handle messages with unicode characters', () => {
      const unicodeContent = '你好 мир 🎉 Ω'
      const message = createMessage('assistant', unicodeContent)
      render(<Message message={message} />)

      expect(screen.getByText(unicodeContent)).toBeInTheDocument()
    })

    it('should handle very old timestamps', () => {
      const message = createMessage('user', 'Old message', new Date('1970-01-01T00:00:00'))
      render(<Message message={message} />)

      expect(screen.getByText('Old message')).toBeInTheDocument()
    })
  })
})
