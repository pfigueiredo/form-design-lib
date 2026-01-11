import { describe, it, expect, beforeEach } from 'vitest'
import React from 'react'
import { FieldRegistry, BaseFieldProps, defaultFieldRegistry } from '../FieldRegistry'

// Mock field components for testing
const MockTextField: React.FC<BaseFieldProps> = ({ field, value }) => {
  return React.createElement('div', { 'data-testid': 'mock-text-field' }, `${field.fieldName}: ${String(value)}`)
}

const MockNumberField: React.FC<BaseFieldProps> = ({ field, value }) => {
  return React.createElement('div', { 'data-testid': 'mock-number-field' }, `${field.fieldName}: ${Number(value)}`)
}

describe('FieldRegistry', () => {
  let registry: FieldRegistry

  beforeEach(() => {
    registry = new FieldRegistry()
  })

  describe('register', () => {
    it('should register a field component', () => {
      registry.register('Text', MockTextField)
      expect(registry.has('Text')).toBe(true)
      expect(registry.get('Text')).toBe(MockTextField)
    })

    it('should throw error when registering duplicate field type without override', () => {
      registry.register('Text', MockTextField)
      expect(() => {
        registry.register('Text', MockNumberField)
      }).toThrow('Field type "Text" is already registered')
    })

    it('should allow overriding when override=true', () => {
      registry.register('Text', MockTextField)
      registry.register('Text', MockNumberField, true)
      expect(registry.get('Text')).toBe(MockNumberField)
    })

    it('should register custom field types (not just built-in FieldType)', () => {
      registry.register('CustomField', MockTextField)
      expect(registry.has('CustomField')).toBe(true)
      expect(registry.get('CustomField')).toBe(MockTextField)
    })
  })

  describe('registerMany', () => {
    it('should register multiple fields from a Map', () => {
      const registrations = new Map([
        ['Text', MockTextField],
        ['Number', MockNumberField],
      ])
      registry.registerMany(registrations)
      expect(registry.has('Text')).toBe(true)
      expect(registry.has('Number')).toBe(true)
    })

    it('should register multiple fields from an object', () => {
      const registrations = {
        Text: MockTextField,
        Number: MockNumberField,
      }
      registry.registerMany(registrations)
      expect(registry.has('Text')).toBe(true)
      expect(registry.has('Number')).toBe(true)
    })

    it('should respect override flag when registering many', () => {
      registry.register('Text', MockTextField)
      const registrations = new Map([['Text', MockNumberField]])
      
      expect(() => {
        registry.registerMany(registrations, false)
      }).toThrow()
      
      registry.registerMany(registrations, true)
      expect(registry.get('Text')).toBe(MockNumberField)
    })
  })

  describe('get', () => {
    it('should return undefined for unregistered field type', () => {
      expect(registry.get('NonExistent')).toBeUndefined()
    })

    it('should return registered component', () => {
      registry.register('Text', MockTextField)
      expect(registry.get('Text')).toBe(MockTextField)
    })
  })

  describe('has', () => {
    it('should return false for unregistered field type', () => {
      expect(registry.has('NonExistent')).toBe(false)
    })

    it('should return true for registered field type', () => {
      registry.register('Text', MockTextField)
      expect(registry.has('Text')).toBe(true)
    })
  })

  describe('unregister', () => {
    it('should return false when unregistering non-existent field type', () => {
      expect(registry.unregister('NonExistent')).toBe(false)
    })

    it('should return true and remove field type when unregistering', () => {
      registry.register('Text', MockTextField)
      expect(registry.unregister('Text')).toBe(true)
      expect(registry.has('Text')).toBe(false)
    })
  })

  describe('getRegisteredTypes', () => {
    it('should return empty array for empty registry', () => {
      expect(registry.getRegisteredTypes()).toEqual([])
    })

    it('should return all registered field types', () => {
      registry.register('Text', MockTextField)
      registry.register('Number', MockNumberField)
      registry.register('CustomField', MockTextField)
      
      const types = registry.getRegisteredTypes()
      expect(types).toContain('Text')
      expect(types).toContain('Number')
      expect(types).toContain('CustomField')
      expect(types.length).toBe(3)
    })
  })

  describe('getAll', () => {
    it('should return empty map for empty registry', () => {
      const all = registry.getAll()
      expect(all.size).toBe(0)
    })

    it('should return a copy of all registrations', () => {
      registry.register('Text', MockTextField)
      registry.register('Number', MockNumberField)
      
      const all = registry.getAll()
      expect(all.size).toBe(2)
      expect(all.get('Text')).toBe(MockTextField)
      expect(all.get('Number')).toBe(MockNumberField)
      
      // Modifying the returned map should not affect the registry
      all.delete('Text')
      expect(registry.has('Text')).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all registrations', () => {
      registry.register('Text', MockTextField)
      registry.register('Number', MockNumberField)
      
      registry.clear()
      
      expect(registry.size()).toBe(0)
      expect(registry.has('Text')).toBe(false)
      expect(registry.has('Number')).toBe(false)
    })
  })

  describe('size', () => {
    it('should return 0 for empty registry', () => {
      expect(registry.size()).toBe(0)
    })

    it('should return correct count of registered fields', () => {
      registry.register('Text', MockTextField)
      expect(registry.size()).toBe(1)
      
      registry.register('Number', MockNumberField)
      expect(registry.size()).toBe(2)
      
      registry.unregister('Text')
      expect(registry.size()).toBe(1)
    })
  })
})

describe('defaultFieldRegistry', () => {
  it('should be initialized with built-in field components', () => {
    // Ensure the registry is initialized
    // Registry is auto-initialized when imported
    
    // Check that common field types are registered
    expect(defaultFieldRegistry.has('Text')).toBe(true)
    expect(defaultFieldRegistry.has('Email')).toBe(true)
    expect(defaultFieldRegistry.has('Password')).toBe(true)
    expect(defaultFieldRegistry.has('Date')).toBe(true)
    expect(defaultFieldRegistry.has('Checkbox')).toBe(true)
    expect(defaultFieldRegistry.has('Dropdown')).toBe(true)
    expect(defaultFieldRegistry.has('Number')).toBe(true)
    expect(defaultFieldRegistry.has('Textarea')).toBe(true)
    expect(defaultFieldRegistry.has('Radio')).toBe(true)
    expect(defaultFieldRegistry.has('File')).toBe(true)
    expect(defaultFieldRegistry.has('MultiSelect')).toBe(true)
    expect(defaultFieldRegistry.has('DateRange')).toBe(true)
    expect(defaultFieldRegistry.has('List')).toBe(true)
    
    // Verify components are actually registered (not just the keys)
    expect(defaultFieldRegistry.get('Text')).toBeDefined()
    expect(defaultFieldRegistry.get('Date')).toBeDefined()
    expect(defaultFieldRegistry.get('List')).toBeDefined()
  })
})
