import { BindingStrategy, ParsedPath } from './BindingStrategy'
import { getNestedValue, setNestedValue } from '../../../utils/nestedValue'

/**
 * Unified Binding Strategy
 * 
 * Handles all types of binding paths:
 * - Simple dot notation: "object.username"
 * - Single array index: "userExperience[0].employer"
 * - Multiple array indices: "object.userExperience[0].subItems[1].property"
 * - Root source only: "object"
 * 
 * This single strategy replaces the need for separate strategies since
 * getNestedValue and setNestedValue already handle all these cases.
 */
export class UnifiedBindingStrategy implements BindingStrategy {
  canHandle(_path: string): boolean {
    // This strategy handles ALL paths
    return true
  }

  parse(path: string): ParsedPath {
    // Extract all array indices (for metadata)
    const arrayIndices: number[] = []
    const indexMatches = path.matchAll(/\[(\d+)\]/g)
    for (const match of indexMatches) {
      arrayIndices.push(parseInt(match[1], 10))
    }

    // Find root source - everything before first bracket or first dot (if dot comes before bracket)
    const firstBracketIndex = path.indexOf('[')
    const firstDotIndex = path.indexOf('.')

    let rootSource: string
    let relativePath: string

    if (firstBracketIndex !== -1) {
      // Path contains array indices
      if (firstDotIndex !== -1 && firstDotIndex < firstBracketIndex) {
        // Path like "object.userExperience[0].employer"
        // Root source is "object" (first part before first dot)
        rootSource = path.substring(0, firstDotIndex)
        // Relative path is everything after the first dot: "userExperience[0].employer"
        relativePath = path.substring(firstDotIndex + 1)
      } else {
        // Path like "userExperience[0].employer" (no dot before bracket)
        // Root source is "userExperience" (everything before first bracket)
        rootSource = path.substring(0, firstBracketIndex)
        // Relative path is everything including the bracket: "[0].employer"
        relativePath = path.substring(firstBracketIndex)
      }
    } else {
      // No array indices - simple dot notation or root source only
      if (firstDotIndex === -1) {
        // Simple root source name (e.g., "object", "countryList")
        rootSource = path
        relativePath = ''
      } else {
        // Path like "object.username"
        rootSource = path.substring(0, firstDotIndex)
        relativePath = path.substring(firstDotIndex + 1)
      }
    }

    return {
      rootSource,
      relativePath,
      isArrayPath: arrayIndices.length > 0,
      arrayIndices,
    }
  }

  resolve(path: string, store: Record<string, any>): any {
    const parsed = this.parse(path)
    
    if (!parsed.relativePath) {
      // Simple root source lookup
      return store[parsed.rootSource]
    }

    // Get root data
    const rootData = store[parsed.rootSource]
    if (rootData === undefined) {
      return undefined
    }

    // Use getNestedValue which handles all cases (simple paths, arrays, nested arrays)
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
    
    // Set nested value using relative path (setNestedValue handles all cases)
    const newRootData = setNestedValue(currentRootData, parsed.relativePath, value)
    
    return { ...store, [parsed.rootSource]: newRootData }
  }
}
