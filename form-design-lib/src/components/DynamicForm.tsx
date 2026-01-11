import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { FormConfig, ApiProvider, ValidationTrigger, VisibilityCondition } from '../types'
import { useStore, ApiError } from '../hooks/useStore'
import { FormField } from './FormField'
import { getNestedValue } from '../utils/nestedValue'
import { BindingResolver } from '../core/BindingResolver'
import { LoaderIcon, CheckCircleIcon, SaveIcon, AlertCircleIcon, RefreshIcon } from './Icons'
import './DynamicForm.css'

export interface DynamicFormProps {
  config: FormConfig
  apiProvider: ApiProvider
  onError?: (error: ApiError) => void
  onValidationError?: (errors: Record<string, string>) => void
  onSubmit?: (data: Record<string, any>) => void | Promise<void>
  onReset?: () => void
  successTimeout?: number
  maxRetries?: number
  retryDelay?: number
  // Optional localStorage persistence (overrides config.persistState if provided)
  persistState?: boolean
  storageKey?: string
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ 
  config, 
  apiProvider,
  onError,
  onValidationError,
  onSubmit,
  onReset,
  successTimeout = 3000,
  maxRetries = 3,
  retryDelay = 1000,
  persistState: persistStateProp,
  storageKey: storageKeyProp,
}) => {
  // Use prop if provided, otherwise fall back to config
  const persistState = persistStateProp !== undefined ? persistStateProp : (config.persistState ?? false)
  const storageKey = storageKeyProp || config.storageKey || `form-${config.formName.replace(/\s+/g, '-').toLowerCase()}`
  const { store, setStore, loadingStates, errors, retrySource, clearError } = useStore({ 
    config, 
    apiProvider,
    maxRetries,
    retryDelay,
    onError,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validatingFields, setValidatingFields] = useState<Set<string>>(new Set())
  
  // Collapsible sections state
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  
  // Store initial state for reset
  const initialStoreRef = useRef<Record<string, any>>({})
  const isInitializedRef = useRef(false)

  // Create BindingResolver instance (memoized for performance)
  const bindingResolver = useMemo(() => new BindingResolver(), [])

  // Initialize collapsible sections
  useEffect(() => {
    if (config.collapsibleSections) {
      const defaultState = config.defaultSectionState || 'expanded'
      if (defaultState === 'collapsed') {
        const allSections = new Set(
          config.fields.map(f => f.section || 'General')
        )
        setCollapsedSections(allSections)
      }
    }
  }, [config.collapsibleSections, config.defaultSectionState, config.fields])

  // Save initial store state
  useEffect(() => {
    if (!isInitializedRef.current && store.object && Object.keys(store.object).length > 0) {
      initialStoreRef.current = JSON.parse(JSON.stringify(store))
      isInitializedRef.current = true
    }
  }, [store])

  // Persist form state to localStorage
  useEffect(() => {
    if (persistState && store.object) {
      try {
        const dataToSave = {
          object: store.object,
          timestamp: Date.now(),
        }
        localStorage.setItem(storageKey, JSON.stringify(dataToSave))
      } catch (error) {
        console.warn('[DynamicForm] Failed to save form state to localStorage:', error)
      }
    }
  }, [store.object, persistState, storageKey])

  // Restore form state from localStorage
  useEffect(() => {
    if (persistState && !isInitializedRef.current) {
      try {
        const savedData = localStorage.getItem(storageKey)
        if (savedData) {
          const parsed = JSON.parse(savedData)
          if (parsed.object) {
            setStore((prev) => ({
              ...prev,
              object: { ...prev.object, ...parsed.object },
            }))
          }
        }
      } catch (error) {
        console.warn('[DynamicForm] Failed to restore form state from localStorage:', error)
      }
    }
  }, [persistState, storageKey, setStore])

  // Check if field should be visible
  const isFieldVisible = useCallback((field: FormConfig['fields'][0]): boolean => {
    // Check explicit visible property
    if (field.visible !== undefined) {
      if (typeof field.visible === 'boolean') {
        if (!field.visible) return false
      } else if (typeof field.visible === 'function') {
        const condition = field.visible as VisibilityCondition
        if (!condition(store, field)) return false
      }
    }

    // Check field dependencies
    if (field.dependsOn) {
      const { field: dependentField, value, values, condition } = field.dependsOn
      const dependentValue = getNestedValue(store, dependentField)

      if (value !== undefined) {
        // Exact value match
        if (dependentValue !== value) return false
      } else if (values !== undefined && Array.isArray(values)) {
        // Value in array
        if (!values.includes(dependentValue)) return false
      } else if (condition) {
        // Custom condition function
        if (!condition(dependentValue)) return false
      } else {
        // Default: show if dependent field has any truthy value
        if (!dependentValue) return false
      }
    }

    return true
  }, [store])

  // Validate a single field
  const validateField = async (
    field: FormConfig['fields'][0],
    value: any,
    trigger: ValidationTrigger = 'onSubmit'
  ): Promise<string | undefined> => {
    // Check if validation should run for this trigger
    const validateOn = field.validateOn || ['onSubmit']
    if (!validateOn.includes(trigger)) {
      return undefined
    }

    // Required validation
    if (field.required && (value === undefined || value === null || value === '')) {
      return field.errorMessages?.required || `${field.fieldName} is required`
    }

    // Skip other validations if field is empty and not required
    if (value === undefined || value === null || value === '') {
      return undefined
    }

    // Min length validation
    if (field.minLength && String(value).length < field.minLength) {
      return (
        field.errorMessages?.minLength ||
        `Must be at least ${field.minLength} ${field.minLength === 1 ? 'character' : 'characters'}`
      )
    }

    // Max length validation
    if (field.maxLength && String(value).length > field.maxLength) {
      return (
        field.errorMessages?.maxLength ||
        `Must be no more than ${field.maxLength} ${field.maxLength === 1 ? 'character' : 'characters'}`
      )
    }

    // Pattern validation
    if (field.validationPattern) {
      const regex = new RegExp(field.validationPattern)
      if (!regex.test(String(value))) {
        return field.errorMessages?.pattern || 'Invalid format'
      }
    }

    // Date validation
    if (field.fieldType === 'Date' && value) {
      const dateValue = typeof value === 'string' ? new Date(value) : new Date(value)
      if (isNaN(dateValue.getTime())) {
        return 'Invalid date'
      }

      if (field.minDate) {
        const minDate = field.minDate === 'today' ? new Date() : new Date(field.minDate)
        minDate.setHours(0, 0, 0, 0)
        const dateValueNormalized = new Date(dateValue)
        dateValueNormalized.setHours(0, 0, 0, 0)
        if (dateValueNormalized < minDate) {
          return (
            field.errorMessages?.minDate ||
            `Date must be ${field.minDate === 'today' ? 'today or ' : ''}after ${field.minDate === 'today' ? '' : minDate.toLocaleDateString()}`
          )
        }
      }

      if (field.maxDate) {
        const maxDate = field.maxDate === 'today' ? new Date() : new Date(field.maxDate)
        maxDate.setHours(23, 59, 59, 999)
        if (dateValue > maxDate) {
          return (
            field.errorMessages?.maxDate ||
            `Date must be ${field.maxDate === 'today' ? 'today or ' : ''}before ${field.maxDate === 'today' ? '' : maxDate.toLocaleDateString()}`
          )
        }
      }
    }

    // DateRange validation
    if (field.fieldType === 'DateRange' && value) {
      const range = value as { startDate?: string; endDate?: string }
      
      if (field.required && (!range.startDate || !range.endDate)) {
        return field.errorMessages?.required || `${field.fieldName} is required`
      }

      if (range.startDate && range.endDate) {
        const startDate = new Date(range.startDate)
        const endDate = new Date(range.endDate)

        if (isNaN(startDate.getTime())) {
          return 'Invalid start date'
        }

        if (isNaN(endDate.getTime())) {
          return 'Invalid end date'
        }

        if (endDate < startDate) {
          return 'End date must be after start date'
        }

        // Validate against minDate/maxDate if specified
        if (field.minDate) {
          const minDate = field.minDate === 'today' ? new Date() : new Date(field.minDate)
          minDate.setHours(0, 0, 0, 0)
          if (startDate < minDate) {
            return (
              field.errorMessages?.minDate ||
              `Start date must be ${field.minDate === 'today' ? 'today or ' : ''}after ${field.minDate === 'today' ? '' : minDate.toLocaleDateString()}`
            )
          }
        }

        if (field.maxDate) {
          const maxDate = field.maxDate === 'today' ? new Date() : new Date(field.maxDate)
          maxDate.setHours(23, 59, 59, 999)
          if (endDate > maxDate) {
            return (
              field.errorMessages?.maxDate ||
              `End date must be ${field.maxDate === 'today' ? 'today or ' : ''}before ${field.maxDate === 'today' ? '' : maxDate.toLocaleDateString()}`
            )
          }
        }
      }
    }

    // Number validation
    if (field.fieldType === 'Number' && value !== undefined && value !== null && value !== '') {
      const numValue = typeof value === 'number' ? value : parseFloat(String(value))
      
      if (isNaN(numValue)) {
        return field.errorMessages?.pattern || 'Please enter a valid number'
      }

      if (field.min !== undefined && numValue < field.min) {
        return field.errorMessages?.min || `Value must be at least ${field.min}`
      }

      if (field.max !== undefined && numValue > field.max) {
        return field.errorMessages?.max || `Value must be no more than ${field.max}`
      }
    }

    // File validation
    if (field.fieldType === 'File' && value) {
      if (field.required && !value) {
        return field.errorMessages?.required || `${field.fieldName} is required`
      }

      if (field.maxFileSize) {
        const files = field.multiple && Array.isArray(value) ? value : [value]
        for (const file of files) {
          if (file instanceof File && file.size > field.maxFileSize) {
            const maxSizeMB = (field.maxFileSize / (1024 * 1024)).toFixed(2)
            return field.errorMessages?.custom || `File size must be less than ${maxSizeMB} MB`
          }
        }
      }
    }

    // MultiSelect validation
    if (field.fieldType === 'MultiSelect' && value) {
      const selections = Array.isArray(value) ? value : [value]
      
      if (field.required && selections.length === 0) {
        return field.errorMessages?.required || `${field.fieldName} is required`
      }

      if (field.maxSelections && selections.length > field.maxSelections) {
        return field.errorMessages?.custom || `Maximum ${field.maxSelections} selections allowed`
      }
    }

    // Custom validation function
    if (field.customValidator) {
      try {
        const customError = await field.customValidator(value, field, store)
        if (customError) {
          return field.errorMessages?.custom || customError
        }
      } catch (error) {
        console.error(`Custom validation error for field ${field.binding}:`, error)
        return 'Validation error occurred'
      }
    }

    return undefined
  }

  const handleFieldChange = async (bindingPath: string, newValue: any, trigger: ValidationTrigger = 'onChange') => {
    // Use BindingResolver to handle path parsing and value setting
    setStore((prev) => {
      return bindingResolver.set(bindingPath, newValue, prev)
    })

    // Find the field for this binding
    const field = config.fields.find((f) => f.binding === bindingPath)
    if (field) {
      // Clear existing error immediately
      if (formErrors[bindingPath]) {
        setFormErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[bindingPath]
          return newErrors
        })
      }

      // Validate on change/blur if configured
      const validateOn = field.validateOn || ['onSubmit']
      if (validateOn.includes(trigger)) {
        setValidatingFields((prev) => new Set(prev).add(bindingPath))
        
        try {
          const error = await validateField(field, newValue, trigger)
          setFormErrors((prev) => {
            const newErrors = { ...prev }
            if (error) {
              newErrors[bindingPath] = error
            } else {
              delete newErrors[bindingPath]
            }
            return newErrors
          })
        } finally {
          setValidatingFields((prev) => {
            const newSet = new Set(prev)
            newSet.delete(bindingPath)
            return newSet
          })
        }
      }
    }
  }

  const handleFieldBlur = (bindingPath: string, value: any) => {
    handleFieldChange(bindingPath, value, 'onBlur')
  }

  const validate = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {}
    const validationPromises: Promise<void>[] = []

    config.fields.forEach((field) => {
      // Only validate visible fields
      if (!isFieldVisible(field)) return

      const value = getNestedValue(store, field.binding)
      const validateOn = field.validateOn || ['onSubmit']
      
      // Only validate fields that should validate on submit
      if (validateOn.includes('onSubmit')) {
        const promise = validateField(field, value, 'onSubmit').then((error) => {
          if (error) {
            newErrors[field.binding] = error
          }
        })
        validationPromises.push(promise)
      }
    })

    // Wait for all validations (including async) to complete
    await Promise.all(validationPromises)

    setFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const isValid = await validate()
    if (!isValid) {
      setSubmitStatus('error')
      if (onValidationError) {
        onValidationError(formErrors)
      }
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      if (onSubmit) {
        await onSubmit(store.object)
      } else {
        console.log('Submitting Form Data:', store.object)
      }
      setSubmitStatus('success')
      setTimeout(() => setSubmitStatus(null), successTimeout)
      
      // Clear persisted state on successful submit if configured
      if (persistState) {
        try {
          localStorage.removeItem(storageKey)
        } catch (error) {
          console.warn('[DynamicForm] Failed to clear persisted state:', error)
        }
      }
    } catch (error) {
      setSubmitStatus('error')
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit form'
      console.error('Form submission error:', error)
      if (onError) {
        onError({
          sourceName: 'form-submission',
          endpoint: '',
          message: errorMessage,
          error,
          timestamp: Date.now(),
          retryCount: 0,
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Form reset functionality
  const handleReset = useCallback(() => {
    if (initialStoreRef.current && Object.keys(initialStoreRef.current).length > 0) {
      setStore(JSON.parse(JSON.stringify(initialStoreRef.current)))
    } else {
      // Reset to empty state
      setStore((prev) => {
        const reset: Record<string, any> = {}
        config.sources.forEach((source) => {
          reset[source.sourceName] = source.sourceName === 'object' ? {} : []
        })
        return { ...reset, ...prev }
      })
    }
    setFormErrors({})
    setSubmitStatus(null)
    
    // Clear persisted state
    if (persistState) {
      try {
        localStorage.removeItem(storageKey)
      } catch (error) {
        console.warn('[DynamicForm] Failed to clear persisted state on reset:', error)
      }
    }

    if (onReset) {
      onReset()
    }
  }, [config.sources, persistState, storageKey, setStore, onReset])

  // Toggle section collapse
  const toggleSection = useCallback((sectionName: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName)
      } else {
        newSet.add(sectionName)
      }
      return newSet
    })
  }, [])

  // Memoize sections computation with visibility filtering
  const sections = useMemo(() => {
    const filteredFields = config.fields.filter((field) => isFieldVisible(field))
    return filteredFields.reduce((acc, field) => {
      const sectionName = field.section || 'General'
      if (!acc[sectionName]) {
        acc[sectionName] = []
      }
      acc[sectionName].push(field)
      return acc
    }, {} as Record<string, typeof config.fields>)
  }, [config.fields, isFieldVisible])

  // Validate for duplicate bindings (warn only, since duplicates are allowed)
  useEffect(() => {
    if (import.meta.env.DEV) {
      const bindingCounts = new Map<string, number>()
      config.fields.forEach((field) => {
        const count = bindingCounts.get(field.binding) || 0
        bindingCounts.set(field.binding, count + 1)
      })
      
      const duplicates = Array.from(bindingCounts.entries())
        .filter(([_, count]) => count > 1)
        .map(([binding]) => binding)
      
      if (duplicates.length > 0) {
        console.warn(
          `[DynamicForm] Multiple fields share the same binding: ${duplicates.join(', ')}. ` +
          `This is allowed but ensure field keys are unique (they are generated from section + fieldName + fieldType + binding + index).`
        )
      }
    }
  }, [config.fields])

  const isFormLoading = loadingStates['object']
  
  // Get all API errors
  const apiErrors = Object.values(errors)
  const hasErrors = apiErrors.length > 0

  if (isFormLoading && Object.keys(store.object || {}).length === 0) {
    return (
      <div className="form-design-loading-container">
        <LoaderIcon size={32} className="form-design-loading-icon" />
        <p className="form-design-loading-text">Loading User Data...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="form-design-form">
      <div className="form-design-form-header">
        <h2 className="form-design-form-title">{config.formName}</h2>
        {submitStatus === 'success' && (
          <span className="form-design-form-success">
            <CheckCircleIcon size={16} className="form-design-form-success-icon" />
            Saved Successfully
          </span>
        )}
        {submitStatus === 'error' && (
          <span className="form-design-form-error">
            <AlertCircleIcon size={16} className="form-design-form-error-icon" />
            Submission Failed
          </span>
        )}
      </div>

      {/* API Error Display */}
      {hasErrors && (
        <div className="form-design-form-api-errors">
          {apiErrors.map((error) => (
            <div key={error.sourceName} className="form-design-form-api-error">
              <div className="form-design-form-api-error-content">
                <AlertCircleIcon size={16} className="form-design-form-api-error-icon" />
                <div className="form-design-form-api-error-text">
                  <strong>Failed to load {error.sourceName}</strong>
                  <span>{error.message}</span>
                  {error.retryCount > 0 && (
                    <span className="form-design-form-api-error-retry">
                      (Retry {error.retryCount}/{maxRetries})
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => retrySource(error.sourceName)}
                className="form-design-form-api-error-retry-button"
                disabled={loadingStates[error.sourceName]}
              >
                <RefreshIcon size={14} className="form-design-form-api-error-retry-icon" />
                Retry
              </button>
              <button
                type="button"
                onClick={() => clearError(error.sourceName)}
                className="form-design-form-api-error-dismiss"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="form-design-form-body">
        {Object.entries(sections).map(([sectionName, fields]) => {
          const isCollapsed = collapsedSections.has(sectionName)
          const canCollapse = config.collapsibleSections

          return (
            <div key={sectionName} className="form-design-form-section">
              <div className="form-design-form-section-header">
                <h3 className="form-design-form-section-title">{sectionName}</h3>
                {canCollapse && (
                  <button
                    type="button"
                    onClick={() => toggleSection(sectionName)}
                    className="form-design-form-section-toggle"
                    aria-expanded={!isCollapsed}
                    aria-label={isCollapsed ? `Expand ${sectionName}` : `Collapse ${sectionName}`}
                  >
                    <span className="form-design-form-section-toggle-icon">
                      {isCollapsed ? '▶' : '▼'}
                    </span>
                  </button>
                )}
              </div>
              {!isCollapsed && (
                <div className={`form-design-form-grid form-design-form-grid-${config.gridSize}`}>
                  {fields.map((field, idx) => {
                    // Create a unique key that handles duplicate bindings
                    const uniqueKey = `${sectionName}-${field.fieldName}-${field.fieldType}-${field.binding}-${idx}`
                    
                    // For List fields, extract array from listSource
                    let fieldValue = getNestedValue(store, field.binding)
                    let isLoadingListSource = false
                    
                    if (field.fieldType === 'List' && field.listSource) {
                      // For List fields, prioritize reading from binding (where edits are stored)
                      // Fall back to listSource only if binding is empty/undefined
                      const bindingValue = getNestedValue(store, field.binding)
                      
                      if (Array.isArray(bindingValue) && bindingValue.length > 0) {
                        // Use data from binding (where edits are stored)
                        fieldValue = bindingValue
                      } else {
                        // Fall back to listSource for initial data
                        const listData = getNestedValue(store, field.listSource)
                        
                        if (Array.isArray(listData)) {
                          // Direct array from source
                          fieldValue = listData
                        } else if (listData && typeof listData === 'object') {
                          // If it's an object, try to find the array property
                          // This handles cases where API returns { userExperience: [...] }
                          const arrayKey = Object.keys(listData).find(key => Array.isArray(listData[key]))
                          fieldValue = arrayKey ? listData[arrayKey] : []
                        } else {
                          fieldValue = []
                        }
                      }
                      
                      // Check loading state for the list source
                      const [listSourceName] = field.listSource.split('.')
                      isLoadingListSource = loadingStates[listSourceName] || false
                      
                      // Add $id to each item if not present (for React keys)
                      // Use stable IDs based on index to prevent re-renders
                      // Only add $id to List field data, not to option lists
                      if (Array.isArray(fieldValue) && fieldValue.length > 0) {
                        fieldValue = fieldValue.map((item: any, idx: number) => {
                          if (!item.$id) {
                            // Use a stable ID based on index and binding (or listSource as fallback)
                            const idSource = field.binding || field.listSource
                            return { ...item, $id: `list-${idSource}-${idx}` }
                          }
                          return item
                        })
                      }
                    }
                    
                    return (
                      <FormField
                        key={uniqueKey}
                        field={field}
                        value={fieldValue}
                        onChange={(val) => handleFieldChange(field.binding, val)}
                        onBlur={(val) => handleFieldBlur(field.binding, val)}
                        error={formErrors[field.binding]}
                        sourceData={store}
                        isLoadingSource={isLoadingListSource || loadingStates[field.optionsSource || '']}
                        isValidating={validatingFields.has(field.binding)}
                        onFieldChange={handleFieldChange}
                        onFieldBlur={handleFieldBlur}
                        fieldErrors={formErrors}
                        validatingFields={validatingFields}
                        loadingStates={loadingStates}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="form-design-form-footer">
        <button 
          type="button"
          onClick={handleReset}
          className="form-design-form-reset"
        >
          Reset
        </button>
        <button 
          type="submit" 
          className="form-design-form-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoaderIcon size={18} className="form-design-form-submit-icon" />
              Submitting...
            </>
          ) : (
            <>
              <SaveIcon size={18} className="form-design-form-submit-icon" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="form-design-form-debug">
        <p className="form-design-form-debug-title">Live Store State (Debug):</p>
        <pre className="form-design-form-debug-content">{JSON.stringify(store, null, 2)}</pre>
      </div>
    </form>
  )
}
