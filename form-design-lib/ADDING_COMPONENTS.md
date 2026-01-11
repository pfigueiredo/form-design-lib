# How to Add New Components and Hooks to the Library

## Adding New Field Types

The library uses a modular field system where each field type is in its own file. This makes it easy to add new field types.

### Step-by-Step Guide

### 1. Create the Field Component

Create a new file in `src/components/fields/` directory:

**Example: `NumberField.tsx`**

```tsx
// src/components/fields/NumberField.tsx
import React from 'react'
import { FormField as FormFieldType } from '../../types'
import { AlertCircleIcon } from '../Icons'

export interface NumberFieldProps {
  field: FormFieldType
  value: any
  onChange: (value: any) => void
  error?: string
}

export const NumberField: React.FC<NumberFieldProps> = ({ field, value, onChange, error }) => {
  const Label = () => (
    <label className="form-design-field-label">
      {field.fieldName} {field.required && <span className="form-design-field-required">*</span>}
    </label>
  )

  const ErrorMsg = () =>
    error ? (
      <p className="form-design-field-error">
        <AlertCircleIcon size={12} className="form-design-field-error-icon" />
        {error}
      </p>
    ) : null

  const commonInputClasses = `form-design-field-input ${error ? 'form-design-field-input-error' : ''}`

  return (
    <>
      <Label />
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={commonInputClasses}
        min={field.minValue}
        max={field.maxValue}
        placeholder={`Enter ${field.fieldName}`}
      />
      <ErrorMsg />
    </>
  )
}
```

### 2. Export from Fields Index

Add your field to `src/components/fields/index.ts`:

```typescript
export { NumberField } from './NumberField'
export type { NumberFieldProps } from './NumberField'
```

### 3. Update Types

Add the new field type to `src/types.ts`:

```typescript
export type FieldType = 'Text' | 'Email' | 'Password' | 'Date' | 'Checkbox' | 'Dropdown' | 'Number'
```

### 4. Add to FormField Component

Update `src/components/FormField.tsx` to include your new field:

```typescript
import { NumberField } from './fields/NumberField'

// In the renderField function:
case 'Number':
  return (
    <NumberField field={field} value={value} onChange={onChange} error={error} />
  )
```

### 5. Use in Your Forms

Now you can use the new field type in your form configuration:

```typescript
{
  fieldName: 'Age',
  fieldType: 'Number',
  required: true,
  binding: 'object.age',
  gridSize: 6,
}
```

## Field Component Structure

Each field component should:

1. **Accept standard props**: `field`, `value`, `onChange`, `error`
2. **Render a Label component** (if needed) - shows field name and required indicator
3. **Render the input element** - the actual form control
4. **Render an ErrorMsg component** (if needed) - shows validation errors
5. **Return JSX fragments** (`<>...</>`) - the wrapper div is handled by FormField

### Available CSS Classes

- `form-design-field-label` - For labels
- `form-design-field-required` - For required asterisk
- `form-design-field-input` - Base input class
- `form-design-field-input-error` - Error state for inputs
- `form-design-field-error` - Error message container
- `form-design-field-error-icon` - Icon in error messages

## Existing Field Components

- **TextField** - Handles Text, Email, and Password types
- **DateField** - Date input
- **CheckboxField** - Checkbox input
- **DropdownField** - Select dropdown with API data source support

## Adding Custom Hooks

### Step-by-Step Guide

### 1. Create the Hook File

Create your hook file in the `src/hooks/` directory:

- `useYourHook.ts` - The hook file

### 2. Write Your Hook

Example structure:

```tsx
// src/hooks/useYourHook.ts
import { useState, useCallback } from 'react'

export interface UseYourHookOptions {
  // Define your options here
  initialValue?: string
  // ... other options
}

export interface UseYourHookReturn {
  // Define what your hook returns
  value: string
  setValue: (value: string) => void
  // ... other return values
}

export function useYourHook({
  initialValue = '',
}: UseYourHookOptions = {}): UseYourHookReturn {
  const [value, setValueState] = useState(initialValue)

  const setValue = useCallback((newValue: string) => {
    setValueState(newValue)
  }, [])

  return {
    value,
    setValue,
  }
}
```

### 3. Export from Hooks Index

Add your hook to `src/hooks/index.ts`:

```typescript
export { useYourHook } from './useYourHook'
export type { UseYourHookOptions, UseYourHookReturn } from './useYourHook'
```

### 4. Export from Main Index

The hooks are already exported from the main `src/index.ts` via the hooks barrel export, so they'll be available automatically.

### 5. Use in Demo App

Import and use in `demo-app/src/App.tsx`:

```tsx
import { useYourHook } from 'form-design-lib'

function MyComponent() {
  const { value, setValue } = useYourHook({ initialValue: 'Hello' })
  // Use your hook
}
```

### 6. Rebuild (if needed)

If you're using the built version:
```bash
cd form-design-lib
npm run build
```

If using source imports (current setup), changes are picked up automatically!

## Example Hooks

### useStore Hook

A form management hook with validation support:

```tsx
import { useStore } from 'form-design-lib'

const { store, setStore, loadingStates } = useStore({
  config,
  apiProvider,
})
```
