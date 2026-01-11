// Types
export type {
  FieldType,
  SourceType,
  ValidationTrigger,
  FormSource,
  FormConfig,
  ApiProvider,
  ValidationFunction,
} from './types'
// Note: FormField type is not exported here to avoid conflict with FormField component
// Import the type directly: import type { FormField } from 'form-design-lib/types'
// Or use: import type { FormField } from 'form-design-lib/src/types'

// Components
export { FormField } from './components/FormField'
export type { FormFieldProps } from './components/FormField'
export { DynamicForm } from './components/DynamicForm'
export type { DynamicFormProps } from './components/DynamicForm'
export { ErrorBoundary } from './components/ErrorBoundary'
export { LoaderIcon, AlertCircleIcon, SaveIcon, CheckCircleIcon, RefreshIcon } from './components/Icons'

// Hooks
export { useStore } from './hooks'
export type { UseStoreReturn, UseStoreOptions, ApiError } from './hooks'

// Utilities
export { getNestedValue, setNestedValue } from './utils/nestedValue'

// Core Abstractions
export { BindingResolver, defaultBindingResolver } from './core/BindingResolver'
export type { BindingStrategy, ParsedPath } from './core/binding/strategies/BindingStrategy'
export { FieldRegistry, defaultFieldRegistry } from './core/FieldRegistry'
export type { BaseFieldProps, FieldComponent } from './core/FieldRegistry'
export { initializeFieldRegistry, ensureInitialized } from './core/fieldRegistrySetup'

// Styles
import './style.css'
