import React from 'react'
import { FormField as FormFieldType } from '../../types'
import { AlertCircleIcon, LoaderIcon } from '../Icons'

export interface DropdownFieldProps {
  field: FormFieldType
  value: any
  onChange: (value: any) => void
  onBlur?: (value: any) => void
  error?: string
  sourceData: Record<string, any>
  isLoadingSource?: boolean
  isValidating?: boolean
}

export const DropdownField: React.FC<DropdownFieldProps> = ({
  field,
  value,
  onChange,
  onBlur,
  error,
  sourceData,
  isLoadingSource = false,
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
  const optionsData = sourceData[field.optionsSource || '']
  const options = Array.isArray(optionsData) ? optionsData : []

  return (
    <>
      <Label />
      <div className="form-design-field-dropdown-wrapper">
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onBlur && onBlur(e.target.value)}
          disabled={isLoadingSource || isValidating}
          className={`${commonInputClasses} ${isLoadingSource ? 'form-design-field-input-loading' : ''}`}
        >
          <option value="">Select...</option>
          {options.map((opt: any, idx: number) => (
            <option key={idx} value={opt[field.valueProperty || 'value']}>
              {opt[field.displayProperty || 'label']}
            </option>
          ))}
        </select>
        {isLoadingSource && (
          <div className="form-design-field-dropdown-loader">
            <LoaderIcon size={16} className="form-design-field-loader-icon" />
          </div>
        )}
      </div>
      <ErrorMsg />
    </>
  )
}
