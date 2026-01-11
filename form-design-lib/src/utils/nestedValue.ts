/**
 * Utility functions for handling deep object access using dot notation
 */

/**
 * Get a nested value from an object using dot notation path
 * Supports array indices like "array[0].property" or "array.0.property"
 * @param obj - The object to access
 * @param path - Dot notation path (e.g., "object.username", "userExperience[0].employer", or "queryString.userId")
 * @returns The value at the path, or undefined if not found
 */
export function getNestedValue<T = any>(obj: any, path: string): T | undefined {
  if (!path || !obj) return undefined

  // Handle "queryString" special case for the demo
  if (path.startsWith('queryString.')) {
    const key = path.split('.')[1]
    // This is a mock - in real usage, this would come from URL params or context
    const mockQueryString: Record<string, any> = { userId: '123' }
    return mockQueryString[key]
  }

  // Handle array indices in path (e.g., "userExperience[0].employer" or "userExperience.0.employer")
  // Convert "[0]" to ".0" for consistent parsing
  const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1')
  const keys = normalizedPath.split('.').filter(k => k !== '') // Remove empty strings (from leading dots)
  
  return keys.reduce((acc, part) => {
    if (acc === null || acc === undefined) return undefined
    return acc[part]
  }, obj)
}

/**
 * Set a nested value in an object using dot notation path
 * Creates intermediate objects/arrays if they don't exist
 * Supports array indices like "array[0].property" or "array.0.property"
 * @param obj - The object to modify
 * @param path - Dot notation path (e.g., "object.username" or "userExperience[0].employer")
 * @param value - The value to set
 * @returns A new object with the value set (immutable operation)
 */
export function setNestedValue<T = any>(obj: any, path: string, value: T): any {
  // Handle both objects and arrays as input
  const isArray = Array.isArray(obj)
  const deepClone = isArray ? [...obj] : JSON.parse(JSON.stringify(obj))
  
  // Handle array indices in path (e.g., "userExperience[0].employer" or "[0].employer")
  // Convert "[0]" to ".0" for consistent parsing
  const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1')
  const keys = normalizedPath.split('.').filter(k => k !== '') // Remove empty strings
  let current: any = deepClone

  // If path starts with array index (e.g., "[0].employer"), we're working with an array
  if (path.startsWith('[')) {
    // Path is like "[0].employer" - current is already the array
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      const nextKey = keys[i + 1]
      
      // Check if current key is a number (array index)
      const isCurrentArrayIndex = !isNaN(Number(key))
      const isNextArrayIndex = !isNaN(Number(nextKey))
      
      if (isCurrentArrayIndex) {
        const index = Number(key)
        // Ensure array is large enough
        if (!Array.isArray(current) || current.length <= index) {
          // This shouldn't happen if path is correct, but handle it
          return deepClone
        }
        // If next key is also a number, ensure nested array exists
        if (isNextArrayIndex && !Array.isArray(current[index])) {
          current[index] = []
        } else if (!isNextArrayIndex && !current[index]) {
          current[index] = {}
        }
        current = current[index]
      } else {
        // Current key is a property name
        if (!current[key]) {
          current[key] = isNextArrayIndex ? [] : {}
        }
        current = current[key]
      }
    }
  } else {
    // Regular path (e.g., "userExperience[0].employer" or "object.username")
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      const nextKey = keys[i + 1]
      
      // Check if current key is a number (array index)
      const isCurrentArrayIndex = !isNaN(Number(key))
      const isNextArrayIndex = !isNaN(Number(nextKey))
      
      if (isCurrentArrayIndex) {
        const index = Number(key)
        // Ensure array exists and is large enough
        if (!Array.isArray(current)) {
          return deepClone // Can't set array index on non-array
        }
        if (current.length <= index) {
          // Extend array to required length
          while (current.length <= index) {
            current.push(isNextArrayIndex ? [] : {})
          }
        }
        // If next key is also a number, ensure nested array exists
        if (isNextArrayIndex && !Array.isArray(current[index])) {
          current[index] = []
        } else if (!isNextArrayIndex && !current[index]) {
          current[index] = {}
        }
        current = current[index]
      } else {
        // Current key is a property name
        if (!current[key]) {
          current[key] = isNextArrayIndex ? [] : {}
        }
        current = current[key]
      }
    }
  }

  // Set the final value
  const finalKey = keys[keys.length - 1]
  if (!isNaN(Number(finalKey))) {
    // Final key is an array index
    const index = Number(finalKey)
    if (Array.isArray(current)) {
      if (current.length <= index) {
        // Extend array if needed
        while (current.length <= index) {
          current.push(undefined)
        }
      }
      current[index] = value
    }
  } else {
    // Final key is a property name
    current[finalKey] = value
  }
  
  return deepClone
}
