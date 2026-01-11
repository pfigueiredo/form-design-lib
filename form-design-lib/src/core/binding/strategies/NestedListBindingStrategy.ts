import { BindingStrategy, ParsedPath } from './BindingStrategy'
import { getNestedValue, setNestedValue } from '../../../utils/nestedValue'

/**
 * Nested List Binding Strategy
 * 
 * Handles deeply nested list paths like:
 * - "object.userExperience[0].subItems[1].property"
 * - "data.items[0].children[2].name"
 * 
 * This is essentially a more complex version of ArrayBindingStrategy
 * that handles multiple levels of nesting.
 */
export class NestedListBindingStrategy implements BindingStrategy {
  canHandle(path: string): boolean {
    // Handle paths with multiple array indices (nested lists)
    const bracketMatches = path.match(/\[\d+\]/g)
    return bracketMatches !== null && bracketMatches.length > 1
  }

  parse(path: string): ParsedPath {
    // Extract all array indices
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
      if (firstDotIndex !== -1 && firstDotIndex < firstBracketIndex) {
        // Path like "object.userExperience[0].subItems[1].property"
        // Root source is "object" (first part before first dot)
        rootSource = path.substring(0, firstDotIndex)
        // Relative path is everything after the first dot: "userExperience[0].subItems[1].property"
        relativePath = path.substring(firstDotIndex + 1)
      } else {
        // Path like "userExperience[0].subItems[1].property" (no dot before bracket)
        // Root source is "userExperience" (everything before first bracket)
        rootSource = path.substring(0, firstBracketIndex)
        // Relative path is everything including the bracket: "[0].subItems[1].property"
        relativePath = path.substring(firstBracketIndex)
      }
    } else {
      // Fallback (shouldn't happen if canHandle is correct)
      rootSource = path.split('.')[0]
      relativePath = path.replace(`${rootSource}.`, '')
    }

    return {
      rootSource,
      relativePath,
      isArrayPath: true,
      arrayIndices,
    }
  }

  resolve(path: string, store: Record<string, any>): any {
    const parsed = this.parse(path)
    const rootData = store[parsed.rootSource]
    
    if (rootData === undefined) {
      return undefined
    }

    // Use getNestedValue which handles nested array indices
    return getNestedValue(rootData, parsed.relativePath)
  }

  set(path: string, value: any, store: Record<string, any>): Record<string, any> {
    const parsed = this.parse(path)
    
    // Get current root data (default to object)
    const currentRootData = store[parsed.rootSource] || {}
    
    // Set nested value using relative path (setNestedValue handles nested array indices)
    const newRootData = setNestedValue(currentRootData, parsed.relativePath, value)
    
    return { ...store, [parsed.rootSource]: newRootData }
  }
}
