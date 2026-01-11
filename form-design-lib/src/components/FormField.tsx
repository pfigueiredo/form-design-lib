import React from 'react'
import { FormField as FormFieldType } from '../types'
import { defaultFieldRegistry } from '../core/FieldRegistry'
import type { BaseFieldProps } from '../core/FieldRegistry'
import './FormField.css'

// Import field registry setup to trigger initialization
// This ensures all built-in fields are registered before use
import '../core/fieldRegistrySetup'

export interface FormFieldProps {
  field: FormFieldType
  value: any
  onChange: (value: any) => void
  onBlur?: (value: any) => void
  error?: string
  sourceData: Record<string, any>
  isLoadingSource?: boolean
  isValidating?: boolean
  // Props for List fields
  onFieldChange?: (bindingPath: string, value: any) => void
  onFieldBlur?: (bindingPath: string, value: any) => void
  fieldErrors?: Record<string, string>
  validatingFields?: Set<string>
  loadingStates?: Record<string, boolean>
}

export const FormField: React.FC<FormFieldProps> = ({
  field,
  value,
  onChange,
  onBlur,
  error,
  sourceData,
  isLoadingSource = false,
  isValidating = false,
  onFieldChange,
  onFieldBlur,
  fieldErrors = {},
  validatingFields = new Set(),
  loadingStates = {},
}) => {
  const gridClass = `form-design-field-col-${field.gridSize || 12}`

  const renderField = () => {
    // Get the field component from the registry
    const FieldComponent = defaultFieldRegistry.get(field.fieldType)

    if (!FieldComponent) {
      if (import.meta.env.DEV) {
        console.warn(
          `[FormField] No component registered for field type "${field.fieldType}". ` +
          `Registered types: ${defaultFieldRegistry.getRegisteredTypes().join(', ')}`
        )
      }
      return null
    }

    // Prepare props for the field component
    const fieldProps: BaseFieldProps = {
      field,
      value,
      onChange,
      onBlur,
      error,
      sourceData,
      isLoadingSource,
      isValidating,
      onFieldChange,
      onFieldBlur,
      fieldErrors,
      validatingFields,
      loadingStates,
    }

    return <FieldComponent {...fieldProps} />
  }

  const fieldContent = renderField()
  if (!fieldContent) return null

  const isCheckbox = field.fieldType === 'Checkbox'
  const wrapperClass = `form-design-field ${gridClass}${isCheckbox ? ' form-design-field-checkbox' : ''}`

  return <div className={wrapperClass}>{fieldContent}</div>
}
