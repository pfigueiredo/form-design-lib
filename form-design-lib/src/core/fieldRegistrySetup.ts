import React from 'react'
import { FieldType } from '../types'
import type { FieldRegistry, BaseFieldProps } from './FieldRegistry'
import { defaultFieldRegistry } from './FieldRegistry'

// Import all field components
import { TextField } from '../components/fields/TextField'
import { DateField } from '../components/fields/DateField'
import { CheckboxField } from '../components/fields/CheckboxField'
import { DropdownField } from '../components/fields/DropdownField'
import { NumberField } from '../components/fields/NumberField'
import { TextareaField } from '../components/fields/TextareaField'
import { RadioField } from '../components/fields/RadioField'
import { FileField } from '../components/fields/FileField'
import { MultiSelectField } from '../components/fields/MultiSelectField'
import { DateRangeField } from '../components/fields/DateRangeField'
import { ListField } from '../components/fields/ListField'

/**
 * Adapter function to wrap field components with different prop interfaces
 * into the standard BaseFieldProps interface
 */
function createFieldAdapter<T extends BaseFieldProps>(
  Component: React.ComponentType<T>,
  propMapper?: (props: BaseFieldProps) => T
): React.ComponentType<BaseFieldProps> {
  return (props: BaseFieldProps) => {
    const mappedProps = propMapper ? propMapper(props) : (props as T)
    return React.createElement(Component, mappedProps)
  }
}

/**
 * Initialize the default field registry with all built-in field components
 * @param registry - The field registry instance to populate (defaults to defaultFieldRegistry)
 */
export function initializeFieldRegistry(registry?: FieldRegistry): FieldRegistry {
  const targetRegistry = registry || defaultFieldRegistry

  // Register Text, Email, Password - all use TextField
  targetRegistry.register('Text', createFieldAdapter(TextField))
  targetRegistry.register('Email', createFieldAdapter(TextField))
  targetRegistry.register('Password', createFieldAdapter(TextField))

  // Register Date
  targetRegistry.register('Date', createFieldAdapter(DateField))

  // Register Checkbox
  targetRegistry.register('Checkbox', createFieldAdapter(CheckboxField))

  // Register Dropdown - needs sourceData and isLoadingSource
  targetRegistry.register(
    'Dropdown',
    createFieldAdapter(DropdownField, (props) => ({
      ...props,
      sourceData: props.sourceData || {},
      isLoadingSource: props.isLoadingSource || false,
    } as any))
  )

  // Register Number
  targetRegistry.register('Number', createFieldAdapter(NumberField))

  // Register Textarea
  targetRegistry.register('Textarea', createFieldAdapter(TextareaField))

  // Register Radio - needs sourceData and isLoadingSource
  targetRegistry.register(
    'Radio',
    createFieldAdapter(RadioField, (props) => ({
      ...props,
      sourceData: props.sourceData || {},
      isLoadingSource: props.isLoadingSource || false,
    } as any))
  )

  // Register File
  targetRegistry.register('File', createFieldAdapter(FileField))

  // Register MultiSelect - needs sourceData and isLoadingSource
  targetRegistry.register(
    'MultiSelect',
    createFieldAdapter(MultiSelectField, (props) => ({
      ...props,
      sourceData: props.sourceData || {},
      isLoadingSource: props.isLoadingSource || false,
    } as any))
  )

  // Register DateRange
  targetRegistry.register('DateRange', createFieldAdapter(DateRangeField))

  // Register List - needs additional props
  targetRegistry.register(
    'List',
    createFieldAdapter(ListField, (props) => {
      if (!props.onFieldChange || !props.onFieldBlur) {
        console.error('[FieldRegistry] List field requires onFieldChange and onFieldBlur props')
        // Return a placeholder component that shows an error
        return {
          ...props,
          onFieldChange: () => {},
          onFieldBlur: () => {},
          fieldErrors: props.fieldErrors || {},
          validatingFields: props.validatingFields || new Set(),
          loadingStates: props.loadingStates || {},
          sourceData: props.sourceData || {},
          isLoadingSource: props.isLoadingSource || false,
        } as any
      }
      return {
        ...props,
        sourceData: props.sourceData || {},
        isLoadingSource: props.isLoadingSource || false,
        fieldErrors: props.fieldErrors || {},
        validatingFields: props.validatingFields || new Set(),
        loadingStates: props.loadingStates || {},
      } as any
    })
  )

  return targetRegistry
}

// Track initialization state
let isInitialized = false

/**
 * Ensure the default field registry is initialized
 * This is called automatically when FormField.tsx imports this module
 * Can also be called manually to ensure initialization
 */
export function ensureInitialized(): void {
  if (!isInitialized) {
    initializeFieldRegistry(defaultFieldRegistry)
    isInitialized = true
  }
}

// Auto-initialize the default registry on module load
// This is safe because FieldRegistry.ts doesn't import from fieldRegistrySetup.ts
// (it only exports defaultFieldRegistry, which is a constant)
initializeFieldRegistry(defaultFieldRegistry)
isInitialized = true
