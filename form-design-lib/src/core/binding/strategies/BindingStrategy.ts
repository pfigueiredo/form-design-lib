/**
 * Binding Strategy Interface
 * 
 * Defines the contract for different binding path resolution strategies.
 * Each strategy handles a specific pattern of binding paths.
 */
export interface ParsedPath {
  rootSource: string
  relativePath: string
  isArrayPath: boolean
  arrayIndices: number[]
}

export interface BindingStrategy {
  /**
   * Check if this strategy can handle the given path
   */
  canHandle(path: string): boolean

  /**
   * Parse a binding path into its components
   * @param path - The binding path (e.g., "object.username", "userExperience[0].employer")
   * @returns Parsed path components
   */
  parse(path: string): ParsedPath

  /**
   * Resolve a value from the store using this path
   * @param path - The binding path
   * @param store - The store object
   * @returns The resolved value
   */
  resolve(path: string, store: Record<string, any>): any

  /**
   * Set a value in the store using this path
   * @param path - The binding path
   * @param value - The value to set
   * @param store - The store object
   * @returns A new store object with the value set
   */
  set(path: string, value: any, store: Record<string, any>): Record<string, any>
}
