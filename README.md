# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## Testing

This project uses **Vitest** and **React Testing Library** for comprehensive testing of business logic and UI components.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (default)
npm test -- --watch

# Run tests once and exit
npm test -- --run

# View tests in interactive UI dashboard
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Coverage

The test suite covers:

1. **Reducer Unit Tests** (`src/hooks/__tests__/useAppState.test.ts` - 40 tests)
   - State transitions for all action types
   - ADD_MESSAGE: appending messages to chats
   - CREATE_CHAT: creating new chats with unique IDs
   - DELETE_CHAT: removing chats and managing active chat state
   - RENAME_CHAT: updating chat titles
   - Settings management and theme toggling
   - Sidebar and settings panel state management

2. **localStorage Persistence Tests** (`src/utils/__tests__/storage.test.ts` - 24 tests)
   - Saving state to localStorage
   - Loading and deserializing state from storage
   - Round-trip persistence integrity
   - Handling corrupted or invalid data gracefully
   - Edge cases with large datasets

3. **Component Tests**

   - **InputArea** (`src/components/chat/InputArea/__tests__/InputArea.test.tsx`)
     - Send button disabled/enabled states based on input
     - Sending messages via button click and Enter key
     - Shift+Enter for multiline input (newline without sending)
     - Loading state shows stop button
     - Message clearing after send

   - **Message** (`src/components/chat/Message/__tests__/Message.test.tsx`)
     - Rendering for user and assistant variants
     - CSS styling differentiation
     - Copy button present for assistant messages only
     - Copy-to-clipboard functionality (mocked)
     - Timestamp formatting
     - Markdown content rendering

   - **Sidebar** (`src/components/sidebar/Sidebar/__tests__/Sidebar.test.tsx`)
     - Displaying all chats
     - Search filter (case-insensitive)
     - Chat selection
     - Delete confirmation dialog
     - New chat creation
     - Settings and logout buttons

### Test Architecture

- **Pure Reducer Testing**: Unit tests for `appReducer` function verify state transitions independently of React
- **Component Testing**: React Testing Library tests focus on user interactions and visible behavior
- **Mock Libraries**: 
  - `localStorage` mocked via `vi.stubGlobal` in test setup
  - API calls mocked to prevent real network requests
  - `navigator.clipboard` mocked for copy-to-clipboard testing

### Writing New Tests

When adding new features:

1. Place tests next to source files in `__tests__` subdirectories
2. Use descriptive `describe()` and `it()` blocks
3. Test user behavior, not implementation details
4. Mock external dependencies (API calls, browser APIs)
5. Keep tests isolated—each test should be independent

Example test structure:
```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render text', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Testing Utilities

- **Vitest**: Modern test runner with zero-config TypeScript support
- **React Testing Library**: Queries and utilities for testing React components
- **user-event**: Simulates realistic user interactions (typing, clicking, keyboard shortcuts)
- **@testing-library/jest-dom**: Custom matchers for DOM assertions

### CI/CD Integration

To integrate into CI/CD:

```bash
npm test -- --run  # Run tests once (suitable for CI pipelines)
npm run test:coverage  # Generate coverage reports
```

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
