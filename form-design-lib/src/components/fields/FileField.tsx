import React, { useRef } from 'react'
import { FormField as FormFieldType } from '../../types'
import { AlertCircleIcon } from '../Icons'

export interface FileFieldProps {
  field: FormFieldType
  value: any
  onChange: (value: any) => void
  onBlur?: (value: any) => void
  error?: string
  isValidating?: boolean
}

export const FileField: React.FC<FileFieldProps> = ({
  field,
  value,
  onChange,
  onBlur,
  error,
  isValidating = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) {
      onChange(null)
      return
    }

    // Validate file size if specified
    if (field.maxFileSize) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > field.maxFileSize) {
          // Error will be handled by validation
          onChange(null)
          return
        }
      }
    }

    // Store FileList or single File
    if (field.multiple) {
      onChange(Array.from(files))
    } else {
      onChange(files[0])
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <>
      <Label />
      <div className="form-design-field-file-wrapper">
        <input
          ref={fileInputRef}
          type="file"
          accept={field.accept}
          multiple={field.multiple}
          onChange={handleFileChange}
          onBlur={() => onBlur && onBlur(value)}
          className={`form-design-field-input form-design-field-file-input ${error ? 'form-design-field-input-error' : ''}`}
          disabled={isValidating}
        />
        {value && (
          <div className="form-design-field-file-info">
            {field.multiple && Array.isArray(value) ? (
              <ul className="form-design-field-file-list">
                {value.map((file: File, idx: number) => (
                  <li key={idx}>
                    {file.name} ({formatFileSize(file.size)})
                  </li>
                ))}
              </ul>
            ) : value instanceof File ? (
              <p className="form-design-field-file-name">
                {value.name} ({formatFileSize(value.size)})
              </p>
            ) : null}
          </div>
        )}
      </div>
      <ErrorMsg />
    </>
  )
}
