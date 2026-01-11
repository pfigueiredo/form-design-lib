import React from 'react'
import { FormField as FormFieldType } from '../../types'
import { AlertCircleIcon } from '../Icons'

export interface RadioFieldProps {
  field: FormFieldType
  value: any
  onChange: (value: any) => void
  onBlur?: (value: any) => void
  error?: string
  sourceData: Record<string, any>
  isLoadingSource?: boolean
  isValidating?: boolean
}

export const RadioField: React.FC<RadioFieldProps> = ({
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

  const optionsData = sourceData[field.optionsSource || '']
  const options = Array.isArray(optionsData) ? optionsData : []
  const layout = field.radioLayout || 'vertical'

  return (
    <>
      <Label />
      <div className={`form-design-field-radio-group form-design-field-radio-${layout}`}>
        {isLoadingSource ? (
          <p className="form-design-field-loading">Loading options...</p>
        ) : options.length === 0 ? (
          <p className="form-design-field-empty">No options available</p>
        ) : (
          options.map((opt: any, idx: number) => {
            const optionValue = opt[field.valueProperty || 'value']
            const optionLabel = opt[field.displayProperty || 'label']
            const isChecked = value === optionValue

            return (
              <label key={idx} className="form-design-field-radio-option">
                <input
                  type="radio"
                  name={field.binding}
                  value={optionValue}
                  checked={isChecked}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={() => onBlur && onBlur(value)}
                  disabled={isValidating}
                  className="form-design-field-radio-input"
                />
                <span className="form-design-field-radio-label">{optionLabel}</span>
              </label>
            )
          })
        )}
      </div>
      <ErrorMsg />
    </>
  )
}
