# Testing Guide

This directory contains test setup and utilities for the form design library.

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

- `setup.ts` - Global test setup and configuration
- `__tests__/` - Test files (co-located with source files or in this directory)

## Writing Tests

### Example Test Structure

```typescript
import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useStore } from '../hooks/useStore'

describe('useStore', () => {
  it('should do something', async () => {
    // Test implementation
  })
})
```

## Test Coverage Goals

- Unit tests for all utility functions
- Hook tests for all custom hooks
- Component tests for all components
- Integration tests for form flows
