import React from 'react'
import { FormField as FormFieldType } from '../../types'
import { AlertCircleIcon } from '../Icons'

export interface TextFieldProps {
  field: FormFieldType
  value: any
  onChange: (value: any) => void
  onBlur?: (value: any) => void
  error?: string
  isValidating?: boolean
}

export const TextField: React.FC<TextFieldProps> = ({ 
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

  return (
    <>
      <Label />
      <input
        type={field.fieldType.toLowerCase()}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onBlur && onBlur(e.target.value)}
        className={commonInputClasses}
        maxLength={field.maxLength}
        placeholder={`Enter ${field.fieldName}`}
        disabled={isValidating}
      />
      <ErrorMsg />
    </>
  )
}
