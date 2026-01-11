import React from 'react'
import type { FieldType, FormField as FormFieldType } from '../types'

/**
 * Base props interface for all field components
 * This standardizes the interface across all field types
 */
export interface BaseFieldProps {
  field: FormFieldType
  value: any
  onChange: (value: any) => void
  onBlur?: (value: any) => void
  error?: string
  sourceData?: Record<string, any>
  isLoadingSource?: boolean
  isValidating?: boolean
  // Extended props for List fields
  onFieldChange?: (bindingPath: string, value: any) => void
  onFieldBlur?: (bindingPath: string, value: any) => void
  fieldErrors?: Record<string, string>
  validatingFields?: Set<string>
  loadingStates?: Record<string, boolean>
}

/**
 * Field component type - any React component that accepts BaseFieldProps
 */
export type FieldComponent = React.ComponentType<BaseFieldProps>

/**
 * Field Registry
 * 
 * Manages registration and retrieval of field components by field type.
 * Enables runtime field registration for plugin/extensibility support.
 * 
 * @example
 * ```typescript
 * const registry = new FieldRegistry()
 * registry.register('Text', TextField)
 * registry.register('CustomField', CustomField) // External plugin
 * 
 * const Component = registry.get('Text')
 * if (Component) {
 *   return <Component {...props} />
 * }
 * ```
 */
export class FieldRegistry {
  private fields: Map<FieldType | string, FieldComponent> = new Map()

  /**
   * Register a field component for a given field type
   * @param fieldType - The field type identifier (can be a built-in FieldType or custom string)
   * @param component - The React component to render for this field type
   * @param override - If true, allows overriding existing registrations (default: false)
   * @throws Error if field type is already registered and override is false
   */
  register(
    fieldType: FieldType | string,
    component: FieldComponent,
    override: boolean = false
  ): void {
    if (this.fields.has(fieldType) && !override) {
      throw new Error(
        `Field type "${fieldType}" is already registered. Use override=true to replace it.`
      )
    }
    this.fields.set(fieldType, component)
  }

  /**
   * Register multiple field components at once
   * @param registrations - Map of field types to components
   * @param override - If true, allows overriding existing registrations (default: false)
   */
  registerMany(
    registrations: Map<FieldType | string, FieldComponent> | Record<string, FieldComponent>,
    override: boolean = false
  ): void {
    const entries = registrations instanceof Map
      ? Array.from(registrations.entries())
      : Object.entries(registrations)

    entries.forEach(([fieldType, component]) => {
      this.register(fieldType, component, override)
    })
  }

  /**
   * Get a field component for a given field type
   * @param fieldType - The field type identifier
   * @returns The registered component, or undefined if not found
   */
  get(fieldType: FieldType | string): FieldComponent | undefined {
    return this.fields.get(fieldType)
  }

  /**
   * Check if a field type is registered
   * @param fieldType - The field type identifier
   * @returns True if the field type is registered, false otherwise
   */
  has(fieldType: FieldType | string): boolean {
    return this.fields.has(fieldType)
  }

  /**
   * Unregister a field type
   * @param fieldType - The field type identifier
   * @returns True if the field type was registered and removed, false otherwise
   */
  unregister(fieldType: FieldType | string): boolean {
    return this.fields.delete(fieldType)
  }

  /**
   * Get all registered field types
   * @returns Array of registered field type identifiers
   */
  getRegisteredTypes(): (FieldType | string)[] {
    return Array.from(this.fields.keys())
  }

  /**
   * Get all registered field components
   * @returns Map of field types to components
   */
  getAll(): Map<FieldType | string, FieldComponent> {
    return new Map(this.fields)
  }

  /**
   * Clear all registrations
   */
  clear(): void {
    this.fields.clear()
  }

  /**
   * Get the number of registered field types
   * @returns The number of registered field types
   */
  size(): number {
    return this.fields.size
  }
}

/**
 * Default field registry instance
 * Will be populated with built-in field components by fieldRegistrySetup.ts
 * The initialization happens in fieldRegistrySetup.ts to avoid circular dependencies
 */
export const defaultFieldRegistry = new FieldRegistry()
