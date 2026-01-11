import React from 'react'
import { FormField as FormFieldType } from '../../types'
import { AlertCircleIcon } from '../Icons'

export interface NumberFieldProps {
  field: FormFieldType
  value: any
  onChange: (value: any) => void
  onBlur?: (value: any) => void
  error?: string
  isValidating?: boolean
}

export const NumberField: React.FC<NumberFieldProps> = ({
  field,
  value,
  onChange,
  onBlur,
  error,
  isValidating = false,
}) => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Allow empty string or valid number
    if (inputValue === '') {
      onChange('')
      return
    }

    // Parse as number
    const numValue = parseFloat(inputValue)
    if (!isNaN(numValue)) {
      onChange(numValue)
    } else {
      // If invalid, still update to allow user to type (validation will catch it)
      onChange(inputValue)
    }
  }

  return (
    <>
      <Label />
      <input
        type="number"
        value={value ?? ''}
        onChange={handleChange}
        onBlur={(e) => {
          const numValue = e.target.value === '' ? '' : parseFloat(e.target.value)
          onBlur && onBlur(isNaN(numValue as number) ? '' : numValue)
        }}
        className={commonInputClasses}
        min={field.min}
        max={field.max}
        step="any"
        placeholder={`Enter ${field.fieldName}`}
        disabled={isValidating}
      />
      <ErrorMsg />
    </>
  )
}
