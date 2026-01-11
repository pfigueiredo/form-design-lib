# Form Designer

A powerful React component library for building dynamic forms from JSON configuration. The library provides a flexible, extensible form engine with support for multiple field types, data binding, validation, conditional fields, and more.

## Project Structure

- `form-design-lib/` - The component library (source code and build output)
- `demo-app/` - Demo application for testing and showcasing the library

## Features

- 🎨 **Dynamic Form Generation** - Build forms from JSON configuration
- 🔌 **Extensible Field System** - Register custom field types at runtime
- 🔗 **Flexible Data Binding** - Support for nested objects, arrays, and complex paths
- ✅ **Built-in Validation** - On-change, on-blur, and on-submit validation with custom validators
- 📡 **API Integration** - Fetch data from multiple sources with dependency management
- 🎯 **Conditional Fields** - Show/hide fields based on other field values
- 💾 **State Persistence** - Optional localStorage persistence
- 🎛️ **Collapsible Sections** - Organize fields into collapsible sections
- 🐛 **Debug Mode** - Track data fetching order and timing

## Getting Started

### 1. Install the Library

```bash
cd form-design-lib
npm install
npm run build
```

### 2. Setup the Demo App

```bash
cd demo-app
npm install
npm run dev
```

The demo app will be available at `http://localhost:5173`

## Quick Start

### Basic Usage

```tsx
import { DynamicForm, FormConfig } from 'form-design-lib'
import 'form-design-lib/style.css'

const config: FormConfig = {
  formName: 'User Registration',
  gridSize: 12,
  sources: [
    {
      sourceName: 'object',
      sourceType: 'API',
      endpoint: '/api/users/123',
    },
  ],
  fields: [
    {
      fieldName: 'Username',
      fieldType: 'Text',
      binding: 'object.username',
      required: true,
    },
    {
      fieldName: 'Email',
      fieldType: 'Email',
      binding: 'object.email',
      required: true,
    },
  ],
}

function App() {
  const apiProvider = {
    call: async (endpoint: string) => {
      // Your API implementation
      const response = await fetch(endpoint)
      return response.json()
    },
  }

  return (
    <DynamicForm
      config={config}
      apiProvider={apiProvider}
      onSubmit={(data) => console.log('Form submitted:', data)}
    />
  )
}
```

## Field Types

The library supports the following built-in field types:

- **Text** - Text input (also used for Email and Password)
- **Number** - Numeric input with min/max validation
- **Textarea** - Multi-line text input
- **Date** - Date picker with min/max date validation
- **DateRange** - Date range picker (start and end dates)
- **Checkbox** - Boolean checkbox
- **Radio** - Radio button group (inline or vertical layout)
- **Dropdown** - Single-select dropdown with options from API
- **MultiSelect** - Multi-select dropdown with checkboxes
- **File** - File upload with type and size restrictions
- **List** - Dynamic list of nested form fields

## Custom Field Types

You can register custom field types at runtime using the Field Registry:

```tsx
import { defaultFieldRegistry, BaseFieldProps } from 'form-design-lib'
import React from 'react'

const CustomColorField: React.FC<BaseFieldProps> = ({ field, value, onChange }) => {
  return (
    <input
      type="color"
      value={value || '#000000'}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

// Register your custom field
defaultFieldRegistry.register('Color', CustomColorField)

// Use it in your config
const config: FormConfig = {
  // ...
  fields: [
    {
      fieldName: 'Background Color',
      fieldType: 'Color', // Your custom type
      binding: 'object.backgroundColor',
    },
  ],
}
```

See [ADDING_CUSTOM_FIELDS.md](./form-design-lib/ADDING_CUSTOM_FIELDS.md) for detailed documentation.

## Advanced Features

### Conditional Fields

Show/hide fields based on other field values:

```tsx
{
  fieldName: 'State',
  fieldType: 'Dropdown',
  binding: 'object.state',
  dependsOn: {
    field: 'object.country',
    value: 'US', // Only show when country is 'US'
  },
}
```

### Data Source Dependencies

Fetch data from multiple sources with dependencies:

```tsx
sources: [
  {
    sourceName: 'countryList',
    sourceType: 'API',
    endpoint: '/api/countries',
  },
  {
    sourceName: 'stateList',
    sourceType: 'API',
    endpoint: '/api/states?country={countryCode}',
    parameters: {
      countryCode: 'object.country', // Depends on country field
    },
  },
]
```

### Validation

Configure validation triggers and custom validators:

```tsx
{
  fieldName: 'Email',
  fieldType: 'Email',
  binding: 'object.email',
  required: true,
  validateOn: ['onChange', 'onBlur'], // Validate on change and blur
  customValidator: async (value, field, store) => {
    // Custom async validation
    const exists = await checkEmailExists(value)
    return exists ? 'Email already registered' : undefined
  },
}
```

### Debug Mode

Enable debug logging to track data fetching:

```tsx
const config: FormConfig = {
  // ...
  debug: true, // Enable debug logging
}
```

This will log fetch order, timing, and details to the console.

## Documentation

- **[ADDING_CUSTOM_FIELDS.md](./form-design-lib/ADDING_CUSTOM_FIELDS.md)** - Guide for creating and registering custom field types
- **[BINDING_SYSTEM.md](./form-design-lib/BINDING_SYSTEM.md)** - Documentation on the binding system architecture
- **[ARCHITECTURE_REVIEW_V2.md](./ARCHITECTURE_REVIEW_V2.md)** - Detailed architecture review and design patterns
- **[architecture_todo.md](./architecture_todo.md)** - Tracked architectural improvements
- **[TODO.md](./TODO.md)** - Feature-specific tasks and improvements

## Development Workflow

1. Make changes to components in `form-design-lib/src/`
2. Run tests: `cd form-design-lib && npm test`
3. Build the library: `cd form-design-lib && npm run build`
4. Test in demo app: `cd demo-app && npm run dev`

The demo app uses Vite aliases to directly import from the library source during development, so changes are reflected immediately without rebuilding.

## API Reference

### DynamicForm Component

```tsx
interface DynamicFormProps {
  config: FormConfig
  apiProvider: ApiProvider
  onError?: (error: ApiError) => void
  onValidationError?: (errors: Record<string, string>) => void
  onSubmit?: (data: Record<string, any>) => void | Promise<void>
  onReset?: () => void
  successTimeout?: number
  maxRetries?: number
  retryDelay?: number
  persistState?: boolean
  storageKey?: string
  collapsibleSections?: boolean
  defaultSectionState?: 'expanded' | 'collapsed'
}
```

### Field Registry

```tsx
import { defaultFieldRegistry } from 'form-design-lib'

// Register a custom field
defaultFieldRegistry.register('CustomType', CustomComponent)

// Register multiple fields
defaultFieldRegistry.registerMany({
  'Type1': Component1,
  'Type2': Component2,
})

// Check if a field is registered
defaultFieldRegistry.has('CustomType')

// Get a field component
const Component = defaultFieldRegistry.get('CustomType')
```

## Testing

Run the test suite:

```bash
cd form-design-lib
npm test
```

Run tests in watch mode:

```bash
npm test -- --watch
```

## License

[Add your license here]

## Contributing

[Add contributing guidelines here]
