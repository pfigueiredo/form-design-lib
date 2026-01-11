/**
 * Type definitions for the dynamic form engine
 */

export type FieldType = 
  | 'Text' 
  | 'Email' 
  | 'Password' 
  | 'Date' 
  | 'Checkbox' 
  | 'Dropdown'
  | 'Number'
  | 'Textarea'
  | 'Radio'
  | 'File'
  | 'MultiSelect'
  | 'DateRange'
  | 'List'

export type SourceType = 'API'

export type ValidationTrigger = 'onChange' | 'onBlur' | 'onSubmit'

export interface FormSource {
  sourceName: string
  sourceType: SourceType
  endpoint: string
  parameters?: Record<string, string>
}

/**
 * Custom validation function
 * @param value - The field value to validate
 * @param field - The field configuration
 * @param store - The entire form store (for cross-field validation)
 * @returns Error message string if invalid, undefined/null if valid, or Promise<string | undefined> for async validation
 */
export type ValidationFunction = (
  value: any,
  field: FormField,
  store: Record<string, any>
) => string | undefined | Promise<string | undefined>

/**
 * Condition function to determine field visibility
 * @param store - The entire form store
 * @param field - The current field being evaluated
 * @returns true if field should be visible, false otherwise
 */
export type VisibilityCondition = (
  store: Record<string, any>,
  field: FormField
) => boolean

export interface FormField {
  section?: string
  fieldName: string
  fieldType: FieldType
  required?: boolean
  maxLength?: number
  minLength?: number
  validationPattern?: string
  binding: string
  gridSize?: number
  // For Dropdown, MultiSelect, and Radio fields
  displayProperty?: string
  valueProperty?: string
  optionsSource?: string
  // For Radio fields - inline or vertical layout
  radioLayout?: 'inline' | 'vertical'
  // For File fields
  accept?: string // File types to accept (e.g., "image/*", ".pdf,.doc")
  multiple?: boolean // Allow multiple file selection
  maxFileSize?: number // Maximum file size in bytes
  // For MultiSelect fields
  maxSelections?: number // Maximum number of selections allowed
  // Validation improvements
  validateOn?: ValidationTrigger[] // When to trigger validation (default: ['onSubmit'])
  customValidator?: ValidationFunction // Custom validation function
  // Configurable error messages
  errorMessages?: {
    required?: string
    minLength?: string
    maxLength?: string
    pattern?: string
    min?: string
    max?: string
    minDate?: string
    maxDate?: string
    custom?: string
  }
  // Date validation
  minDate?: string // ISO date string or 'today'
  maxDate?: string // ISO date string or 'today'
  // Number validation
  min?: number
  max?: number
  // Conditional visibility
  visible?: boolean | VisibilityCondition // Field visibility condition
  // Field dependencies - show/hide based on other field values
  dependsOn?: {
    field: string // Binding path of the field this depends on
    value?: any // Show when this value matches (exact match)
    values?: any[] // Show when value is in this array
    condition?: (value: any) => boolean // Custom condition function
  }
  // For List fields
  listSource?: string // Source name or path to get array data (e.g., "experienceList" or "experienceList.userExperience")
  itemObject?: string // Optional identifier for the item type
  fields?: FormField[] // Nested fields for each list item
  minItems?: number // Minimum number of items required
  maxItems?: number // Maximum number of items allowed
}

export interface FormConfig {
  formName: string
  gridSize: number
  sources: FormSource[]
  fields: FormField[]
  // Form features
  persistState?: boolean // Enable localStorage persistence
  storageKey?: string // Custom storage key (default: form-{formName})
  collapsibleSections?: boolean // Enable collapsible sections
  defaultSectionState?: 'expanded' | 'collapsed' // Default state for sections
  /**
   * Enable debug logging for data fetching operations
   * When enabled, logs fetch order, timing, and details to console
   */
  debug?: boolean
}

export interface ApiProvider {
  call: (endpoint: string, method?: string) => Promise<any>
}
