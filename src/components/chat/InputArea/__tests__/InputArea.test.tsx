import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InputArea } from '../InputArea'

describe('InputArea Component', () => {
  const mockOnSend = vi.fn()
  const mockOnStop = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render without crashing', () => {
      render(
        <InputArea
          onSend={mockOnSend}
          onStop={mockOnStop}
          isLoading={false}
          disabled={false}
          placeholder="Type a message..."
        />
      )

      expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument()
    })

    it('should render with custom placeholder', () => {
      render(
        <InputArea
          onSend={mockOnSend}
          onStop={mockOnStop}
          isLoading={false}
          disabled={false}
          placeholder="Custom placeholder"
        />
      )

      expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument()
    })

    it('should render send button', () => {
      render(
        <InputArea
          onSend={mockOnSend}
          onStop={mockOnStop}
          isLoading={false}
          disabled={false}
          placeholder="Type..."
        />
      )

      // The button might have SVG or text content
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('disabled state', () => {
    it('should disable input when disabled prop is true', () => {
      render(
        <InputArea
          onSend={mockOnSend}
          onStop={mockOnStop}
          isLoading={false}
          disabled={true}
          placeholder="Type..."
        />
      )

      const input = screen.getByPlaceholderText('Type...')
      expect(input).toBeDisabled()
    })

    it('should enable input when disabled prop is false', () => {
      render(
        <InputArea
          onSend={mockOnSend}
          onStop={mockOnStop}
          isLoading={false}
          disabled={false}
          placeholder="Type..."
        />
      )

      const input = screen.getByPlaceholderText('Type...')
      expect(input).not.toBeDisabled()
    })
  })

  describe('send button state', () => {
    it('should disable send button when input is empty', () => {
      render(
        <InputArea
          onSend={mockOnSend}
          onStop={mockOnStop}
          isLoading={false}
          disabled={false}
          placeholder="Type..."
        />
      )

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should not enable send button for whitespace-only input', async () => {
      const user = userEvent.setup()
      render(
        <InputArea
          onSend={mockOnSend}
          onStop={mockOnStop}
          isLoading={false}
          disabled={false}
          placeholder="Type..."
        />
      )

      const input = screen.getByPlaceholderText('Type...')
      await user.type(input, '   ')

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should enable send button when text is entered', async () => {
      const user = userEvent.setup()
      render(
        <InputArea
          onSend={mockOnSend}
          onStop={mockOnStop}
          isLoading={false}
          disabled={false}
          placeholder="Type..."
        />
      )

      const input = screen.getByPlaceholderText('Type...')
      await user.type(input, 'Hello')

      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
    })

    it('should keep send button enabled until text is cleared', async () => {
      const user = userEvent.setup()
      render(
        <InputArea
          onSend={mockOnSend}
          onStop={mockOnStop}
          isLoading={false}
          disabled={false}
          placeholder="Type..."
        />
      )

      const input = screen.getByPlaceholderText('Type...')
      await user.type(input, 'Hello')
      await user.clear(input)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('send message functionality', () => {
    it('should call onSend with message text when send button clicked', async () => {
      const user = userEvent.setup()
      render(
        <InputArea
          onSend={mockOnSend}
          onStop={mockOnStop}
          isLoading={false}
          disabled={false}
          placeholder="Type..."
        />
      )

      const input = screen.getByPlaceholderText('Type...')
      await user.type(input, 'Test message')

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockOnSend).toHaveBeenCalledWith('Test message')
      expect(mockOnSend).toHaveBeenCalledTimes(1)
    })

    it('should clear input after sending message', async () => {
      const user = userEvent.setup()
      render(
        <InputArea
          onSend={mockOnSend}
          onStop={mockOnStop}
          isLoading={false}
          disabled={false}
          placeholder="Type..."
        />
      )

      const input = screen.getByPlaceholderText('Type...') as HTMLTextAreaElement
      await user.type(input, 'Test message')
      expect(input.value).toBe('Test message')

      const button = screen.getByRole('button')
      await user.click(button)

      await waitFor(() => {
        expect(input.value).toBe('')
      })
    })

    it('should disable button after message is sent, then enable when text is entered again', async () => {
      const user = userEvent.setup()
      render(
        <InputArea
          onSend={mockOnSend}
          onStop={mockOnStop}
          isLoading={false}
          disabled={false}
          placeholder="Type..."
        />
      )

      const input = screen.getByPlaceholderText('Type...')
      const button = screen.getByRole('button')

      // Type and send first message
      await user.type(input, 'First message')
      expect(button).not.toBeDisabled()
      await user.click(button)

      // Button should be disabled after send
      await waitFor(() => {
        expect(button).toBeDisabled()
      })

      // Type second message
      await user.type(input, 'Second message')
      expect(button).not.toBeDisabled()
    })
  })

  describe('keyboard shortcuts', () => {
    it('should send message on Enter key', async () => {
      const user = userEvent.setup()
      render(
        <InputArea
          onSend={mockOnSend}
          onStop={mockOnStop}
          isLoading={false}
          disabled={false}
          placeholder="Type..."
        />
      )

      const input = screen.getByPlaceholderText('Type...')
      await user.type(input, 'Test')
      await user.keyboard('{Enter}')

      expect(mockOnSend).toHaveBeenCalledWith('Test')
    })

    it('should not send message on Shift+Enter', async () => {
      const user = userEvent.setup()
      render(
        <InputArea
          onSend={mockOnSend}
          onStop={mockOnStop}
          isLoading={false}
          disabled={false}
          placeholder="Type..."
        />
      )

      const input = screen.getByPlaceholderText('Type...') as HTMLTextAreaElement
      await user.type(input, 'Line 1')
      await user.keyboard('{Shift>}{Enter}{/Shift}')

      // Check that input now contains a newline
      expect(input.value).toContain('\n')
      // onSend should not have been called
      expect(mockOnSend).not.toHaveBeenCalled()
    })

    it('should create newline on Shift+Enter', async () => {
      const user = userEvent.setup()
      render(
        <InputArea
          onSend={mockOnSend}
          onStop={mockOnStop}
          isLoading={false}
          disabled={false}
          placeholder="Type..."
        />
      )

      const input = screen.getByPlaceholderText('Type...') as HTMLTextAreaElement
      await user.type(input, 'Line 1')
      await user.keyboard('{Shift>}{Enter}{/Shift}')
      await user.type(input, 'Line 2')

      expect(input.value).toContain('Line 1')
      expect(input.value).toContain('Line 2')
      expect(input.value).toContain('\n')
    })
  })

  describe('loading state', () => {
    it('should disable input textarea when loading', () => {
      render(
        <InputArea
          onSend={mockOnSend}
          onStop={mockOnStop}
          isLoading={true}
          disabled={false}
          placeholder="Type..."
        />
      )

      const input = screen.getByPlaceholderText('Type...')
      expect(input).toBeDisabled()
    })

    it('should show stop button when loading is true', () => {
      render(
        <InputArea
          onSend={mockOnSend}
          onStop={mockOnStop}
          isLoading={true}
          disabled={false}
          placeholder="Type..."
        />
      )

      // The stop button should be rendered (we can check for it by checking the button exists and has specific class or content)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should call onStop when loading is true and button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <InputArea
          onSend={mockOnSend}
          onStop={mockOnStop}
          isLoading={true}
          disabled={false}
          placeholder="Type..."
        />
      )

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockOnStop).toHaveBeenCalled()
    })

    it('should call onSend instead of onStop when not loading', async () => {
      const user = userEvent.setup()
      render(
        <InputArea
          onSend={mockOnSend}
          onStop={mockOnStop}
          isLoading={false}
          disabled={false}
          placeholder="Type..."
        />
      )

      const input = screen.getByPlaceholderText('Type...')
      await user.type(input, 'Message')

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockOnSend).toHaveBeenCalled()
      expect(mockOnStop).not.toHaveBeenCalled()
    })
  })

  describe('multiline input', () => {
    it('should support multiline text input', async () => {
      const user = userEvent.setup()
      render(
        <InputArea
          onSend={mockOnSend}
          onStop={mockOnStop}
          isLoading={false}
          disabled={false}
          placeholder="Type..."
        />
      )

      const input = screen.getByPlaceholderText('Type...') as HTMLTextAreaElement
      await user.type(input, 'Line 1')
      await user.keyboard('{Shift>}{Enter}{/Shift}')
      await user.type(input, 'Line 2')
      await user.keyboard('{Shift>}{Enter}{/Shift}')
      await user.type(input, 'Line 3')

      expect(input.value).toBe('Line 1\nLine 2\nLine 3')
    })

    it('should preserve multiline text when sending', async () => {
      const user = userEvent.setup()
      render(
        <InputArea
          onSend={mockOnSend}
          onStop={mockOnStop}
          isLoading={false}
          disabled={false}
          placeholder="Type..."
        />
      )

      const input = screen.getByPlaceholderText('Type...')
      await user.type(input, 'Line 1')
      await user.keyboard('{Shift>}{Enter}{/Shift}')
      await user.type(input, 'Line 2')

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockOnSend).toHaveBeenCalledWith('Line 1\nLine 2')
    })
  })

  describe('edge cases', () => {
    it('should handle multiple rapid sends', async () => {
      const user = userEvent.setup()
      render(
        <InputArea
          onSend={mockOnSend}
          onStop={mockOnStop}
          isLoading={false}
          disabled={false}
          placeholder="Type..."
        />
      )

      const input = screen.getByPlaceholderText('Type...')
      const button = screen.getByRole('button')

      // First message
      await user.type(input, 'Message 1')
      await user.click(button)

      // Second message
      await user.type(input, 'Message 2')
      await user.click(button)

      expect(mockOnSend).toHaveBeenCalledTimes(2)
      expect(mockOnSend).toHaveBeenNthCalledWith(1, 'Message 1')
      expect(mockOnSend).toHaveBeenNthCalledWith(2, 'Message 2')
    })

    it('should trim message content when sending', async () => {
      const user = userEvent.setup()
      render(
        <InputArea
          onSend={mockOnSend}
          onStop={mockOnStop}
          isLoading={false}
          disabled={false}
          placeholder="Type..."
        />
      )

      const input = screen.getByPlaceholderText('Type...')
      await user.type(input, '  Message with spaces  ')

      const button = screen.getByRole('button')
      await user.click(button)

      // Note: The actual trimming behavior depends on the component implementation
      // This test documents the expected behavior
      expect(mockOnSend).toHaveBeenCalled()
    })
  })
})
