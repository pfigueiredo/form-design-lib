import React from 'react'
import { FormField as FormFieldType } from '../../types'
import { AlertCircleIcon } from '../Icons'

export interface DateFieldProps {
  field: FormFieldType
  value: any
  onChange: (value: any) => void
  onBlur?: (value: any) => void
  error?: string
  isValidating?: boolean
}

export const DateField: React.FC<DateFieldProps> = ({ 
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
        type="date"
        value={value ? new Date(value).toISOString().split('T')[0] : ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onBlur && onBlur(e.target.value)}
        className={commonInputClasses}
        min={field.minDate === 'today' ? new Date().toISOString().split('T')[0] : field.minDate}
        max={field.maxDate === 'today' ? new Date().toISOString().split('T')[0] : field.maxDate}
        disabled={isValidating}
      />
      <ErrorMsg />
    </>
  )
}
