# Form Design Library

A React component library for building dynamic forms from JSON configuration.

## Installation

```bash
npm install form-design-lib
```

## Features

- **Dynamic Form Rendering**: Build forms from JSON configuration
- **Multiple Field Types**: Text, Email, Password, Date, Checkbox, and Dropdown
- **API Data Sources**: Fetch data from APIs with dependency management
- **Form Validation**: Built-in validation with custom patterns
- **Section Grouping**: Organize fields into sections
- **Grid Layout**: Flexible grid system for responsive layouts
- **TypeScript Support**: Full TypeScript definitions included

## Usage

### Basic Example

```tsx
import { DynamicForm, FormConfig, ApiProvider } from 'form-design-lib'
import 'form-design-lib/style.css'

const config: FormConfig = {
  FormName: 'User Registration',
  gridSize: 12,
  Sources: [
    {
      sourceName: 'countryList',
      sourceType: 'API',
      endpoint: '/api/countries',
    },
  ],
  Fields: [
    {
      section: 'User Information',
      fieldName: 'Username',
      fieldType: 'Text',
      required: true,
      binding: 'object.username',
      gridSize: 6,
    },
  ],
}

// Required: Provide your own API implementation
const apiProvider: ApiProvider = {
  call: async (endpoint, method = 'GET') => {
    const response = await fetch(endpoint, { method })
    return response.json()
  },
}

function App() {
  return <DynamicForm config={config} apiProvider={apiProvider} />
}
```

## Configuration

### FormConfig

```typescript
interface FormConfig {
  FormName: string
  gridSize: number // Grid columns (1-12)
  Sources: FormSource[]
  Fields: FormField[]
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
  fieldType: 'Text' | 'Email' | 'Password' | 'Date' | 'Checkbox' | 'Dropdown'
  required?: boolean
  maxLength?: number
  minLength?: number
  validationPattern?: string // Regex pattern
  binding: string // Dot notation path (e.g., 'object.username')
  gridSize?: number // Column span (1-12)
  // For Dropdown fields:
  displayProperty?: string // Property to display
  valueProperty?: string // Property to use as value
  optionsSource?: string // Source name for options
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

## Examples

See the `demo-app` directory for a complete working example.
