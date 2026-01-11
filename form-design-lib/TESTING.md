# Testing Guide

This document explains how to run and write tests for the form design library.

## Setup

The library uses [Vitest](https://vitest.dev/) as the testing framework, which is fast and works seamlessly with Vite.

### Installation

Dependencies are already added to `package.json`. Install them with:

```bash
npm install
```

## Running Tests

```bash
# Run tests in watch mode (recommended for development)
npm test

# Run tests once
npm run test:run

# Run tests with UI (interactive)
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are organized as follows:

```
form-design-lib/
├── src/
│   ├── hooks/
│   │   ├── __tests__/
│   │   │   └── useStore.test.ts
│   │   └── useStore.ts
│   ├── utils/
│   │   └── __tests__/ (to be created)
│   └── test/
│       ├── setup.ts
│       └── README.md
└── vitest.config.ts
```

## Writing Tests

### Test File Naming

- Test files should be named `*.test.ts` or `*.test.tsx`
- Place them in `__tests__` directories next to the source files, or in a `test` directory

### Example Test

```typescript
import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useStore } from '../useStore'

describe('useStore', () => {
  it('should do something', async () => {
    // Arrange
    const mockApiProvider = {
      call: vi.fn(async () => ({ data: 'test' }))
    }

    // Act
    const { result } = renderHook(() => 
      useStore({ config, apiProvider: mockApiProvider })
    )

    // Assert
    await waitFor(() => {
      expect(result.current.store).toBeDefined()
    })
  })
})
```

## Test Coverage

The test suite includes comprehensive tests for:

### useStore Hook Tests

1. **Infinite Loop Prevention**
   - ✅ Tests that store updates don't trigger infinite API calls
   - ✅ Tests dependent sources don't cause loops
   - ✅ Tests caching prevents duplicate calls
   - ✅ Tests rapid store updates are handled correctly

2. **API Call Behavior**
   - ✅ Tests sources are fetched on mount
   - ✅ Tests loading states work correctly
   - ✅ Tests error handling

## Coverage Goals

- **Current:** ~30% (useStore hook tests)
- **Target:** 80%+ coverage
- **Priority:** Utilities → Hooks → Components

## Best Practices

1. **Use descriptive test names** - Describe what the test verifies
2. **Follow AAA pattern** - Arrange, Act, Assert
3. **Mock external dependencies** - Use `vi.fn()` for API calls
4. **Test edge cases** - Empty states, errors, rapid updates
5. **Keep tests isolated** - Each test should be independent
6. **Use `waitFor` for async** - Don't use arbitrary timeouts

## Debugging Tests

### Run a specific test file

```bash
npm test useStore.test.ts
```

### Run tests matching a pattern

```bash
npm test infinite
```

### Debug in VS Code

Add this to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["test", "--", "--inspect-brk"],
  "console": "integratedTerminal"
}
```

## Continuous Integration

Tests should be run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm run test:run

- name: Generate coverage
  run: npm run test:coverage
```
