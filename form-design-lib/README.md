# form-design-lib

A powerful React component library for building dynamic forms from JSON configuration with built-in API integration, validation, and extensibility.

[![npm version](https://img.shields.io/npm/v/form-design-lib)](https://www.npmjs.com/package/form-design-lib)
[![License: GPL v2](https://img.shields.io/badge/License-GPL%20v2-blue.svg)](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue.svg)](https://www.typescriptlang.org/)

## Installation

```bash
npm install form-design-lib
```

## Features

- 🎨 **Dynamic Form Generation** - Build forms from JSON/TypeScript configuration
- 🔌 **Extensible Field System** - Register custom field types at runtime
- 🔗 **Flexible Data Binding** - Support for nested objects, arrays, and complex paths
- ✅ **Built-in Validation** - On-change, on-blur, and on-submit validation with custom validators
- 📡 **API Integration** - Fetch data from multiple sources with dependency management
- 🎯 **Conditional Fields** - Show/hide fields based on other field values
- 💾 **State Persistence** - Optional localStorage persistence
- 🎛️ **Collapsible Sections** - Organize fields into collapsible sections
- 🐛 **Debug Mode** - Track data fetching order and timing
- 📦 **Optimized Bundle** - ~19KB gzipped (ES module) with all features included

## Usage

### Basic Example

```tsx
import { DynamicForm, FormConfig, ApiProvider } from 'form-design-lib'
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
    {
      sourceName: 'countryList',
      sourceType: 'API',
      endpoint: '/api/countries',
    },
  ],
  fields: [
    {
      section: 'User Information',
      fieldName: 'Username',
      fieldType: 'Text',
      required: true,
      binding: 'object.username',
      gridSize: 6,
    },
    {
      fieldName: 'Country',
      fieldType: 'Dropdown',
      binding: 'object.country',
      optionsSource: 'countryList',
      gridSize: 6,
    },
  ],
}

// Required: Provide your own API implementation
const apiProvider: ApiProvider = {
  call: async (endpoint: string) => {
    const response = await fetch(endpoint)
    return response.json()
  },
}

function App() {
  return (
    <DynamicForm
      config={config}
      apiProvider={apiProvider}
      onSubmit={(data) => console.log('Form submitted:', data)}
    />
  )
}
```

## Configuration

### FormConfig

```typescript
interface FormConfig {
  formName: string
  gridSize: number // Grid columns (1-12)
  sources: FormSource[]
  fields: FormField[]
  debug?: boolean // Enable debug logging
  persistState?: boolean // Enable localStorage persistence
  storageKey?: string // localStorage key
  collapsibleSections?: boolean // Enable collapsible sections
  defaultSectionState?: 'expanded' | 'collapsed'
}
```

### FormSource

```typescript
interface FormSource {
  sourceName: string // Unique identifier for the data source
  sourceType: 'API'
  endpoint: string // API endpoint URL
  parameters?: Record<string, string> // Parameter mappings (e.g., { id: 'object.userId' })
}
```

### FormField

```typescript
interface FormField {
  section?: string // Section name for grouping
  fieldName: string // Display label
  fieldType: 'Text' | 'Email' | 'Password' | 'Number' | 'Textarea' | 'Date' | 'DateRange' | 'Checkbox' | 'Radio' | 'Dropdown' | 'MultiSelect' | 'File' | 'List'
  required?: boolean
  maxLength?: number
  minLength?: number
  validationPattern?: string // Regex pattern
  validateOn?: ('onChange' | 'onBlur' | 'onSubmit')[] // Validation triggers
  customValidator?: (value: any, field: FormField, store: Record<string, any>) => string | undefined | Promise<string | undefined>
  binding: string // Dot notation path (e.g., 'object.username' or 'object.userExperience[0].employer')
  gridSize?: number // Column span (1-12)
  visible?: boolean | ((value: any, store: Record<string, any>) => boolean) // Conditional visibility
  dependsOn?: { field: string; value: any } // Show/hide based on other field
  // For Dropdown/Radio/MultiSelect fields:
  displayProperty?: string // Property to display
  valueProperty?: string // Property to use as value
  optionsSource?: string // Source name for options
  // For List fields:
  listSource?: string // Source name for list data
  itemObject?: string // Object name for nested fields
  fields?: FormField[] // Nested fields for list items
  // For Date fields:
  minDate?: string // Minimum date (ISO format)
  maxDate?: string // Maximum date (ISO format)
  // For Number fields:
  min?: number // Minimum value
  max?: number // Maximum value
}
```

## API Provider

The library requires an `ApiProvider` to handle API calls. You must provide your own implementation:

```typescript
interface ApiProvider {
  call: (endpoint: string, method?: string) => Promise<any>
}
```

For development and testing, you can create a mock implementation (see `demo-app/src/mockApi.ts` for an example).

## Components

### DynamicForm

Main form component that renders fields based on configuration.

**Props:**
- `config: FormConfig` - Form configuration
- `apiProvider: ApiProvider` - Required API provider

### FormField

Individual field component (typically used internally by DynamicForm).

## Hooks

### useStore

Manages form state and API data sources.

```typescript
const { store, setStore, loadingStates } = useStore({
  config,
  apiProvider,
})
```

## Utilities

### getNestedValue

Get a nested value from an object using dot notation.

```typescript
const value = getNestedValue(obj, 'object.username')
```

### setNestedValue

Set a nested value in an object using dot notation.

```typescript
const newObj = setNestedValue(obj, 'object.username', 'newvalue')
```

## Field Types

The library supports 11+ built-in field types:

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
  fields: [
    {
      fieldName: 'Background Color',
      fieldType: 'Color', // Your custom type
      binding: 'object.backgroundColor',
    },
  ],
}
```

See [ADDING_CUSTOM_FIELDS.md](./ADDING_CUSTOM_FIELDS.md) for detailed documentation.

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
  validateOn: ['onChange', 'onBlur'],
  customValidator: async (value, field, store) => {
    const exists = await checkEmailExists(value)
    return exists ? 'Email already registered' : undefined
  },
}
```

## Documentation

- **[Getting Started Guide](https://github.com/pfigueiredo/form-design-lib/blob/main/README.md)** - Complete installation and usage guide
- **[Custom Fields Guide](./ADDING_CUSTOM_FIELDS.md)** - How to create and register custom field types
- **[Binding System](./BINDING_SYSTEM.md)** - Understanding the binding system architecture
- **[Architecture Review](../ARCHITECTURE_REVIEW_V2.md)** - Detailed architecture review
- **[Testing Guide](./TESTING.md)** - Testing guide and best practices
- **[Comparison](../COMPARISON.md)** - Comparison with other form libraries

## Examples

See the `demo-app` directory in the repository for a complete working example.

## License

This project is licensed under the GNU General Public License v2.0 (GPLv2).

For commercial use that requires a different license, please contact pedro@t3k.pt.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/pfigueiredo/form-design-lib/issues)
- **GitHub Discussions**: [Ask questions or share ideas](https://github.com/pfigueiredo/form-design-lib/discussions)
- **Commercial License**: Contact pedro@t3k.pt
