import React from 'react'
import { FormField as FormFieldType } from '../../types'
import { AlertCircleIcon, LoaderIcon } from '../Icons'

export interface MultiSelectFieldProps {
  field: FormFieldType
  value: any
  onChange: (value: any) => void
  onBlur?: (value: any) => void
  error?: string
  sourceData: Record<string, any>
  isLoadingSource?: boolean
  isValidating?: boolean
}

export const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
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
  
  // Ensure value is always an array
  const selectedValues = Array.isArray(value) ? value : value ? [value] : []

  const handleChange = (optionValue: any) => {
    const newSelected = selectedValues.includes(optionValue)
      ? selectedValues.filter((v) => v !== optionValue)
      : [...selectedValues, optionValue]

    // Check max selections if specified
    if (field.maxSelections && newSelected.length > field.maxSelections) {
      return // Don't allow more selections
    }

    onChange(newSelected)
  }

  return (
    <>
      <Label />
      <div className="form-design-field-multiselect-wrapper">
        {isLoadingSource ? (
          <div className="form-design-field-multiselect-loading">
            <LoaderIcon size={16} className="form-design-field-loader-icon" />
            <span>Loading options...</span>
          </div>
        ) : options.length === 0 ? (
          <p className="form-design-field-empty">No options available</p>
        ) : (
          <div className="form-design-field-multiselect-options">
            {options.map((opt: any, idx: number) => {
              const optionValue = opt[field.valueProperty || 'value']
              const optionLabel = opt[field.displayProperty || 'label']
              const isSelected = selectedValues.includes(optionValue)
              const isDisabled = 
                isValidating || 
                (field.maxSelections && 
                 !isSelected && 
                 selectedValues.length >= field.maxSelections)

              return (
                <label
                  key={idx}
                  className={`form-design-field-multiselect-option ${isSelected ? 'form-design-field-multiselect-option-selected' : ''} ${isDisabled ? 'form-design-field-multiselect-option-disabled' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleChange(optionValue)}
                    onBlur={() => onBlur && onBlur(selectedValues)}
                    disabled={!!isDisabled}
                    className="form-design-field-multiselect-checkbox"
                  />
                  <span className="form-design-field-multiselect-label">{optionLabel}</span>
                </label>
              )
            })}
          </div>
        )}
        {field.maxSelections && (
          <p className="form-design-field-multiselect-hint">
            {selectedValues.length} / {field.maxSelections} selected
          </p>
        )}
      </div>
      <ErrorMsg />
    </>
  )
}
