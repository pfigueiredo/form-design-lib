import React from 'react'
import { FormField as FormFieldType } from '../../types'
import { AlertCircleIcon } from '../Icons'

export interface DateRangeFieldProps {
  field: FormFieldType
  value: any
  onChange: (value: any) => void
  onBlur?: (value: any) => void
  error?: string
  isValidating?: boolean
}

export const DateRangeField: React.FC<DateRangeFieldProps> = ({
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

  // Value should be { startDate: string, endDate: string } or null
  const rangeValue = value || { startDate: '', endDate: '' }

  const formatDateForInput = (date: string | Date | null | undefined): string => {
    if (!date) return ''
    const dateObj = date instanceof Date ? date : new Date(date)
    if (isNaN(dateObj.getTime())) return ''
    return dateObj.toISOString().split('T')[0]
  }

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...rangeValue,
      startDate: e.target.value,
    })
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...rangeValue,
      endDate: e.target.value,
    })
  }

  const startDateValue = formatDateForInput(rangeValue.startDate)
  const endDateValue = formatDateForInput(rangeValue.endDate)

  // Calculate min/max for end date based on start date
  const endDateMin = startDateValue || field.minDate === 'today' 
    ? new Date().toISOString().split('T')[0] 
    : field.minDate
  const endDateMax = field.maxDate === 'today' 
    ? new Date().toISOString().split('T')[0] 
    : field.maxDate

  return (
    <>
      <Label />
      <div className="form-design-field-daterange-wrapper">
        <div className="form-design-field-daterange-input-group">
          <label className="form-design-field-daterange-label">Start Date</label>
          <input
            type="date"
            value={startDateValue}
            onChange={handleStartDateChange}
            onBlur={() => onBlur && onBlur(rangeValue)}
            className={commonInputClasses}
            min={field.minDate === 'today' ? new Date().toISOString().split('T')[0] : field.minDate}
            max={endDateValue || (field.maxDate === 'today' ? new Date().toISOString().split('T')[0] : field.maxDate)}
            disabled={isValidating}
          />
        </div>
        <div className="form-design-field-daterange-separator">to</div>
        <div className="form-design-field-daterange-input-group">
          <label className="form-design-field-daterange-label">End Date</label>
          <input
            type="date"
            value={endDateValue}
            onChange={handleEndDateChange}
            onBlur={() => onBlur && onBlur(rangeValue)}
            className={commonInputClasses}
            min={endDateMin}
            max={endDateMax}
            disabled={isValidating}
          />
        </div>
      </div>
      <ErrorMsg />
    </>
  )
}
