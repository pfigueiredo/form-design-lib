import React from 'react'
import { FormField as FormFieldType } from '../../types'
import { AlertCircleIcon } from '../Icons'

export interface CheckboxFieldProps {
  field: FormFieldType
  value: any
  onChange: (value: any) => void
  onBlur?: (value: any) => void
  error?: string
  isValidating?: boolean
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({ 
  field, 
  value, 
  onChange, 
  onBlur,
  error,
  isValidating = false,
}) => {
  const ErrorMsg = () =>
    error ? (
      <p className="form-design-field-error">
        <AlertCircleIcon size={12} className="form-design-field-error-icon" />
        {error}
      </p>
    ) : null

  return (
    <>
      <input
        type="checkbox"
        id={field.binding}
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
        onBlur={() => onBlur && onBlur(value)}
        className="form-design-field-checkbox-input"
        disabled={isValidating}
      />
      <label htmlFor={field.binding} className="form-design-field-checkbox-label">
        {field.fieldName}
      </label>
      <ErrorMsg />
    </>
  )
}
