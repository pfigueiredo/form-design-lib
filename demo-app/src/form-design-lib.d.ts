// Type declarations for form-design-lib
// This helps TypeScript resolve the module when using Vite aliases
declare module 'form-design-lib' {
  import type { FormFieldProps } from '../form-design-lib/src/components/FormField'
  import type { DynamicFormProps } from '../form-design-lib/src/components/DynamicForm'
  import type { UseStoreReturn, UseStoreOptions } from '../form-design-lib/src/hooks/useStore'
  import type {
    FieldType,
    SourceType,
    FormSource,
    FormField,
    FormConfig,
    ApiProvider,
  } from '../form-design-lib/src/types'

  // Types
  export type {
    FieldType,
    SourceType,
    FormSource,
    FormField,
    FormConfig,
    ApiProvider,
  }

  // Components
  export { FormField } from '../form-design-lib/src/components/FormField'
  export type { FormFieldProps }
  export { DynamicForm } from '../form-design-lib/src/components/DynamicForm'
  export type { DynamicFormProps }
  export {
    LoaderIcon,
    AlertCircleIcon,
    SaveIcon,
    CheckCircleIcon,
  } from '../form-design-lib/src/components/Icons'

  // Hooks
  export { useStore } from '../form-design-lib/src/hooks/useStore'
  export type { UseStoreReturn, UseStoreOptions }

  // Utilities
  export { getNestedValue, setNestedValue } from '../form-design-lib/src/utils/nestedValue'
}
