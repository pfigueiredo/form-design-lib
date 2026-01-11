# Adding Custom Field Types

This guide explains how to create and register custom field types in the form-design-lib using the Field Registry system.

## Table of Contents

- [Overview](#overview)
- [Creating a Custom Field Component](#creating-a-custom-field-component)
- [Registering Your Field](#registering-your-field)
- [Advanced Examples](#advanced-examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Field Registry system allows you to extend the form library with custom field types without modifying the core code. This enables:

- **Plugin Development**: Create reusable field components as separate packages
- **Custom Business Logic**: Implement domain-specific field types
- **Third-Party Integration**: Integrate external UI component libraries
- **Runtime Registration**: Add fields dynamically based on configuration

### How It Works

1. Create a React component that implements the `BaseFieldProps` interface
2. Register your component with the `FieldRegistry` using a unique field type identifier
3. Use your custom field type in `FormConfig` just like built-in fields

---

## Creating a Custom Field Component

### Step 1: Create Your Component

Your custom field component must accept `BaseFieldProps` as its props. Here's a minimal example:

```typescript
import React from 'react'
import { BaseFieldProps } from 'form-design-lib'
import { AlertCircleIcon } from 'form-design-lib'

export const CustomTextField: React.FC<BaseFieldProps> = ({
  field,
  value,
  onChange,
  onBlur,
  error,
  isValidating = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleBlur = () => {
    if (onBlur) {
      onBlur(value)
    }
  }

  return (
    <div className="form-design-field-wrapper">
      <label className="form-design-field-label">
        {field.fieldName}
        {field.required && <span className="form-design-field-required">*</span>}
        {isValidating && <span className="form-design-field-validating">Validating...</span>}
      </label>
      
      <input
        type="text"
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`form-design-field-input ${error ? 'form-design-field-input-error' : ''}`}
        placeholder={field.fieldName}
        disabled={isValidating}
      />
      
      {error && (
        <p className="form-design-field-error">
          <AlertCircleIcon size={12} />
          {error}
        </p>
      )}
    </div>
  )
}
```

### Step 2: Understand BaseFieldProps

The `BaseFieldProps` interface provides all the props your component will receive:

```typescript
interface BaseFieldProps {
  field: FormField              // The field configuration from FormConfig
  value: any                    // Current field value
  onChange: (value: any) => void // Callback to update the value
  onBlur?: (value: any) => void  // Optional blur callback
  error?: string                 // Validation error message (if any)
  sourceData?: Record<string, any> // Data from API sources (for dropdowns, etc.)
  isLoadingSource?: boolean      // Loading state for source data
  isValidating?: boolean         // Whether field is currently being validated
  
  // Extended props for List fields (only needed if creating a List field type)
  onFieldChange?: (bindingPath: string, value: any) => void
  onFieldBlur?: (bindingPath: string, value: any) => void
  fieldErrors?: Record<string, string>
  validatingFields?: Set<string>
  loadingStates?: Record<string, boolean>
}
```

### Step 3: Access Field Configuration

Your component receives the full `FormField` configuration, which includes:

- `field.fieldName`: Display name for the field
- `field.required`: Whether the field is required
- `field.binding`: The binding path in the store
- `field.gridSize`: Grid column size (1-12)
- `field.fieldType`: The field type identifier
- Custom properties: Any additional properties you define in your field config

---

## Registering Your Field

### Method 1: Register at Application Startup

Register your field when your application initializes:

```typescript
import { defaultFieldRegistry } from 'form-design-lib'
import { CustomTextField } from './CustomTextField'

// Register your custom field
defaultFieldRegistry.register('CustomText', CustomTextField)
```

### Method 2: Register Multiple Fields

Use `registerMany` to register multiple fields at once:

```typescript
import { defaultFieldRegistry } from 'form-design-lib'
import { CustomTextField } from './CustomTextField'
import { CustomNumberField } from './CustomNumberField'
import { CustomDateField } from './CustomDateField'

defaultFieldRegistry.registerMany({
  'CustomText': CustomTextField,
  'CustomNumber': CustomNumberField,
  'CustomDate': CustomDateField,
})
```

### Method 3: Create a Custom Registry

If you want to isolate your custom fields, create a separate registry:

```typescript
import { FieldRegistry } from 'form-design-lib'
import { CustomTextField } from './CustomTextField'

const myCustomRegistry = new FieldRegistry()
myCustomRegistry.register('CustomText', CustomTextField)

// Then use it in your FormField component (requires custom implementation)
```

### Method 4: Override Existing Fields

You can override built-in field types (use with caution):

```typescript
import { defaultFieldRegistry } from 'form-design-lib'
import { MyCustomTextField } from './MyCustomTextField'

// Override the built-in 'Text' field type
defaultFieldRegistry.register('Text', MyCustomTextField, true) // override=true
```

---

## Advanced Examples

### Example 1: Dropdown Field with Custom Data Source

This example shows how to create a field that uses `sourceData`:

```typescript
import React from 'react'
import { BaseFieldProps } from 'form-design-lib'
import { AlertCircleIcon, LoaderIcon } from 'form-design-lib'

export const CustomDropdownField: React.FC<BaseFieldProps> = ({
  field,
  value,
  onChange,
  onBlur,
  error,
  sourceData = {},
  isLoadingSource = false,
  isValidating = false,
}) => {
  // Get options from sourceData using optionsSource
  const optionsSource = field.optionsSource || ''
  const options = sourceData[optionsSource] || []
  
  // Support displayProperty and valueProperty like built-in DropdownField
  const displayProperty = field.displayProperty || 'name'
  const valueProperty = field.valueProperty || 'value'

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="form-design-field-wrapper">
      <label className="form-design-field-label">
        {field.fieldName}
        {field.required && <span className="form-design-field-required">*</span>}
        {isLoadingSource && <LoaderIcon size={12} />}
      </label>
      
      <select
        value={value || ''}
        onChange={handleChange}
        onBlur={onBlur}
        className={`form-design-field-select ${error ? 'form-design-field-input-error' : ''}`}
        disabled={isLoadingSource || isValidating}
      >
        <option value="">Select {field.fieldName}</option>
        {options.map((option: any, index: number) => (
          <option
            key={index}
            value={option[valueProperty]}
          >
            {option[displayProperty]}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="form-design-field-error">
          <AlertCircleIcon size={12} />
          {error}
        </p>
      )}
    </div>
  )
}

// Register it
defaultFieldRegistry.register('CustomDropdown', CustomDropdownField)
```

### Example 2: Field with Custom Validation UI

This example shows a field with custom validation feedback:

```typescript
import React, { useState } from 'react'
import { BaseFieldProps } from 'form-design-lib'

export const CustomValidatedField: React.FC<BaseFieldProps> = ({
  field,
  value,
  onChange,
  onBlur,
  error,
  isValidating = false,
}) => {
  const [touched, setTouched] = useState(false)

  const handleBlur = () => {
    setTouched(true)
    if (onBlur) {
      onBlur(value)
    }
  }

  const showError = touched && error
  const isValid = touched && !error && value

  return (
    <div className="form-design-field-wrapper">
      <label className="form-design-field-label">
        {field.fieldName}
        {field.required && <span className="form-design-field-required">*</span>}
      </label>
      
      <div className="custom-field-input-wrapper">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          className={`
            form-design-field-input
            ${showError ? 'form-design-field-input-error' : ''}
            ${isValid ? 'form-design-field-input-valid' : ''}
          `}
        />
        {isValid && <span className="custom-field-checkmark">✓</span>}
      </div>
      
      {showError && (
        <p className="form-design-field-error">{error}</p>
      )}
    </div>
  )
}
```

### Example 3: Field with Custom Properties

This example shows how to use custom properties in your field configuration:

```typescript
import React from 'react'
import { BaseFieldProps, FormField } from 'form-design-lib'

// Extend FormField type to include custom properties
interface CustomColorFieldConfig extends FormField {
  fieldType: 'CustomColor'
  colorFormat?: 'hex' | 'rgb' | 'hsl'
  showPicker?: boolean
}

export const CustomColorField: React.FC<BaseFieldProps> = ({
  field,
  value,
  onChange,
  error,
}) => {
  const config = field as CustomColorFieldConfig
  const colorFormat = config.colorFormat || 'hex'
  const showPicker = config.showPicker !== false

  return (
    <div className="form-design-field-wrapper">
      <label className="form-design-field-label">
        {field.fieldName}
        {field.required && <span className="form-design-field-required">*</span>}
      </label>
      
      <div className="custom-color-field">
        {showPicker && (
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="custom-color-picker"
          />
        )}
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={colorFormat === 'hex' ? '#000000' : 'rgb(0,0,0)'}
          className="form-design-field-input"
        />
      </div>
      
      {error && <p className="form-design-field-error">{error}</p>}
    </div>
  )
}

// Register it
defaultFieldRegistry.register('CustomColor', CustomColorField)
```

Then use it in your config:

```typescript
const config: FormConfig = {
  formName: 'My Form',
  gridSize: 12,
  sources: [],
  fields: [
    {
      fieldName: 'Background Color',
      fieldType: 'CustomColor', // Your custom type
      binding: 'object.backgroundColor',
      colorFormat: 'hex',        // Custom property
      showPicker: true,          // Custom property
      required: true,
    },
  ],
}
```

---

## Best Practices

### 1. Naming Conventions

- Use descriptive, unique field type names (e.g., `CustomColorPicker` instead of `Color`)
- Prefix custom field types to avoid conflicts (e.g., `MyCompanyTextField`)
- Follow the pattern: `[Prefix][FieldType]` (e.g., `MaterialTextField`)

### 2. Component Structure

- Always handle `undefined` or `null` values gracefully
- Provide default values for optional props
- Use the provided CSS classes for consistency
- Include loading and validation states

### 3. Error Handling

- Always display error messages when provided
- Show validation state visually
- Handle edge cases (empty data, missing sources, etc.)

### 4. Type Safety

- Extend `FormField` interface for custom properties
- Use TypeScript to ensure type safety
- Document your custom properties

### 5. Registration

- Register fields early in your application lifecycle
- Use a dedicated registration file/module
- Consider creating a plugin package for reusable fields

### 6. Testing

- Test your field component in isolation
- Test with various field configurations
- Test error states and edge cases

---

## Using Your Custom Field

Once registered, use your custom field in `FormConfig` just like built-in fields:

```typescript
import { DynamicForm, FormConfig } from 'form-design-lib'
import { defaultFieldRegistry } from 'form-design-lib'
import { CustomTextField } from './CustomTextField'

// Register your field
defaultFieldRegistry.register('CustomText', CustomTextField)

// Use it in your config
const config: FormConfig = {
  formName: 'My Form',
  gridSize: 12,
  sources: [],
  fields: [
    {
      fieldName: 'Custom Input',
      fieldType: 'CustomText', // Your custom field type
      binding: 'object.customField',
      required: true,
    },
  ],
}

function App() {
  return <DynamicForm config={config} apiProvider={mockApiProvider} />
}
```

---

## Troubleshooting

### Field Not Rendering

**Problem**: Your custom field doesn't appear in the form.

**Solutions**:
1. Verify the field is registered before `DynamicForm` renders
2. Check that `fieldType` in config matches the registration key exactly
3. Ensure your component returns valid JSX (not `null` or `undefined`)
4. Check browser console for warnings/errors

### Type Errors

**Problem**: TypeScript errors when using custom field types.

**Solutions**:
1. Extend the `FieldType` type if needed:
   ```typescript
   type ExtendedFieldType = FieldType | 'CustomText' | 'CustomNumber'
   ```
2. Use type assertions if necessary:
   ```typescript
   const config = {
     // ... your config
   } as FormConfig
   ```

### Props Not Received

**Problem**: Your component doesn't receive expected props.

**Solutions**:
1. Ensure your component accepts `BaseFieldProps`
2. Check that you're using the correct prop names
3. Verify the adapter in `fieldRegistrySetup.ts` if you created a custom one

### Override Not Working

**Problem**: Can't override a built-in field type.

**Solutions**:
1. Use `override: true` when registering:
   ```typescript
   defaultFieldRegistry.register('Text', MyField, true)
   ```
2. Register before `DynamicForm` is rendered
3. Check that the field type name matches exactly

---

## API Reference

### FieldRegistry Methods

```typescript
// Register a single field
registry.register(fieldType: string, component: FieldComponent, override?: boolean): void

// Register multiple fields
registry.registerMany(
  registrations: Map<string, FieldComponent> | Record<string, FieldComponent>,
  override?: boolean
): void

// Get a field component
registry.get(fieldType: string): FieldComponent | undefined

// Check if a field is registered
registry.has(fieldType: string): boolean

// Unregister a field
registry.unregister(fieldType: string): boolean

// Get all registered types
registry.getRegisteredTypes(): string[]

// Get all registrations
registry.getAll(): Map<string, FieldComponent>

// Clear all registrations
registry.clear(): void

// Get registry size
registry.size(): number
```

### BaseFieldProps Interface

See the [Creating a Custom Field Component](#step-2-understand-basefieldprops) section for the full interface definition.

---

## Next Steps

- Check out the built-in field components in `src/components/fields/` for reference
- Review the `FieldRegistry` implementation in `src/core/FieldRegistry.ts`
- Explore the `fieldRegistrySetup.ts` to see how built-in fields are registered
- Consider creating a plugin package for reusable custom fields

---

## Support

For issues or questions:
- Review the main [README.md](./README.md)
- Check the [Architecture Review](./ARCHITECTURE_REVIEW_V2.md) for design patterns
- Open an issue on the project repository
