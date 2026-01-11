import React from 'react'
import { FormField as FormFieldType } from '../../types'
import { FormField } from '../FormField'
import { AlertCircleIcon, LoaderIcon } from '../Icons'
import '../FormField.css'
import './ListField.css'

export interface ListFieldProps {
  field: FormFieldType
  value: any // Array of items
  onChange: (value: any) => void
  onBlur?: (value: any) => void
  error?: string
  sourceData: Record<string, any>
  isLoadingSource?: boolean
  isValidating?: boolean
  // Props for nested field handling
  onFieldChange: (bindingPath: string, value: any) => void
  onFieldBlur: (bindingPath: string, value: any) => void
  fieldErrors: Record<string, string>
  validatingFields: Set<string>
  loadingStates: Record<string, boolean>
}

export const ListField: React.FC<ListFieldProps> = ({
  field,
  value,
  error,
  sourceData,
  isLoadingSource = false,
  isValidating = false,
  onFieldChange,
  onFieldBlur,
  fieldErrors,
  validatingFields,
  loadingStates,
}) => {
  const Label = () => (
    <label className="form-design-field-label">
      {field.fieldName} {field.required && <span className="form-design-field-required">*</span>}
      {isValidating && <LoaderIcon size={12} className="form-design-field-loader-icon ml-2" />}
    </label>
  )

  const ErrorMsg = () =>
    error ? (
      <p className="form-design-field-error">
        <AlertCircleIcon size={12} className="form-design-field-error-icon" />
        {error}
      </p>
    ) : null

  // Ensure value is an array
  const items = Array.isArray(value) ? value : []

  // Get nested fields for list items
  const nestedFields = field.fields || []

  if (nestedFields.length === 0) {
    console.warn(`[ListField] Field "${field.fieldName}" has type "List" but no nested fields defined`)
    return (
      <>
        <Label />
        <p className="form-design-field-error">List field requires nested fields configuration</p>
        <ErrorMsg />
      </>
    )
  }

  if (isLoadingSource) {
    return (
      <>
        <Label />
        <div className="form-design-field-list-loading">
          <LoaderIcon size={16} className="form-design-field-loader-icon" />
          <span>Loading {field.fieldName}...</span>
        </div>
        <ErrorMsg />
      </>
    )
  }

  if (items.length === 0) {
    return (
      <>
        <Label />
        <div className="form-design-field-list-empty">
          <p>No {field.fieldName.toLowerCase()} found</p>
        </div>
        <ErrorMsg />
      </>
    )
  }

  return (
    <>
      <Label />
      <div className="form-design-field-list-wrapper">
        {items.map((item: any, index: number) => {
          // Generate a stable key for each item (use $id if available, otherwise use index)
          // The $id should be stable and not change on re-renders
          const itemKey = item.$id || `${field.binding}-item-${index}`
          // Use field.binding for the update path (e.g., "object.userExperience")
          // This is where the data should be stored in the main object
          const itemBinding = `${field.binding}[${index}]`

          return (
            <div key={itemKey} className="form-design-field-list-item">
              <div className="form-design-field-list-item-header">
                <h4 className="form-design-field-list-item-title">
                  {field.fieldName} #{index + 1}
                </h4>
              </div>
              <div className="form-design-field-list-item-content">
                {nestedFields.map((nestedField, nestedIdx) => {
                  // Extract the property name from nested field binding
                  // If nestedField.binding is "experienceItem.employer", extract "employer"
                  // The itemObject prefix (e.g., "experienceItem") is used for organization
                  // but the actual property name is what we need
                  let nestedProperty: string
                  if (field.itemObject && nestedField.binding.startsWith(`${field.itemObject}.`)) {
                    // Remove the itemObject prefix: "experienceItem.employer" -> "employer"
                    nestedProperty = nestedField.binding.replace(`${field.itemObject}.`, '')
                  } else if (nestedField.binding.includes('.')) {
                    // If it has a dot but doesn't match itemObject, use the last part
                    nestedProperty = nestedField.binding.split('.').pop() || nestedField.binding
                  } else {
                    // No prefix, use as-is
                    nestedProperty = nestedField.binding
                  }
                  
                  // Build binding path for nested field using BindingResolver
                  // This ensures consistent path construction: "object.userExperience[0].employer"
                  const nestedBinding = `${itemBinding}.${nestedProperty}`
                  
                  // Get value for this nested field from the item
                  const nestedValue = item[nestedProperty]

                  return (
                    <FormField
                      key={`${itemKey}-${nestedProperty}-${nestedIdx}`}
                      field={nestedField}
                      value={nestedValue}
                      onChange={(val) => onFieldChange(nestedBinding, val)}
                      onBlur={(val) => onFieldBlur(nestedBinding, val)}
                      error={fieldErrors[nestedBinding]}
                      sourceData={sourceData}
                      isLoadingSource={loadingStates[nestedField.optionsSource || '']}
                      isValidating={validatingFields.has(nestedBinding)}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <ErrorMsg />
    </>
  )
}
