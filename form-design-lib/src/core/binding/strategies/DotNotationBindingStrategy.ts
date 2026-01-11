import { BindingStrategy, ParsedPath } from './BindingStrategy'
import { getNestedValue, setNestedValue } from '../../../utils/nestedValue'

/**
 * Dot Notation Binding Strategy
 * 
 * Handles simple dot notation paths like:
 * - "object.username"
 * - "object.user.profile.name"
 * - "queryString.userId"
 */
export class DotNotationBindingStrategy implements BindingStrategy {
  canHandle(path: string): boolean {
    // Handle paths that:
    // 1. Don't contain array indices (no brackets)
    // 2. Have at least one dot (rootSource.property)
    // 3. Or are simple root source names (for top-level sources)
    return !path.includes('[') && !path.includes(']')
  }

  parse(path: string): ParsedPath {
    const firstDotIndex = path.indexOf('.')
    
    if (firstDotIndex === -1) {
      // Simple root source name (e.g., "object", "countryList")
      return {
        rootSource: path,
        relativePath: '',
        isArrayPath: false,
        arrayIndices: [],
      }
    }

    // Split into root source and relative path
    const rootSource = path.substring(0, firstDotIndex)
    const relativePath = path.substring(firstDotIndex + 1)

    return {
      rootSource,
      relativePath,
      isArrayPath: false,
      arrayIndices: [],
    }
  }

  resolve(path: string, store: Record<string, any>): any {
    const parsed = this.parse(path)
    
    if (!parsed.relativePath) {
      // Simple root source lookup
      return store[parsed.rootSource]
    }

    // Use getNestedValue for nested paths
    const rootData = store[parsed.rootSource]
    if (rootData === undefined) {
      return undefined
    }

    return getNestedValue(rootData, parsed.relativePath)
  }

  set(path: string, value: any, store: Record<string, any>): Record<string, any> {
    const parsed = this.parse(path)
    
    if (!parsed.relativePath) {
      // Setting root source directly
      return { ...store, [parsed.rootSource]: value }
    }

    // Get current root data (default to object)
    const currentRootData = store[parsed.rootSource] || {}
    
    // Set nested value using relative path
    const newRootData = setNestedValue(currentRootData, parsed.relativePath, value)
    
    return { ...store, [parsed.rootSource]: newRootData }
  }
}
