import { BindingStrategy, ParsedPath } from './binding/strategies/BindingStrategy'
import { UnifiedBindingStrategy } from './binding/strategies/UnifiedBindingStrategy'

/**
 * Binding Resolver
 * 
 * Centralizes all binding path resolution logic.
 * Uses strategy pattern to handle different types of binding paths.
 * 
 * @example
 * ```typescript
 * const resolver = new BindingResolver()
 * const value = resolver.resolve('object.username', store)
 * const newStore = resolver.set('object.userExperience[0].employer', 'New Employer', store)
 * const parsed = resolver.parse('userExperience[0].employer')
 * ```
 */
export class BindingResolver {
  private strategies: BindingStrategy[] = []

  constructor() {
    // Register the unified strategy that handles all path types
    // Additional custom strategies can be registered if needed
    this.registerStrategy(new UnifiedBindingStrategy())
  }

  /**
   * Register a custom binding strategy
   * Strategies are checked in the order they are registered
   */
  registerStrategy(strategy: BindingStrategy): void {
    // Insert at the beginning to check more specific strategies first
    this.strategies.unshift(strategy)
  }

  /**
   * Find the appropriate strategy for a given path
   */
  private findStrategy(path: string): BindingStrategy {
    for (const strategy of this.strategies) {
      if (strategy.canHandle(path)) {
        return strategy
      }
    }

    // Fallback to dot notation if no strategy matches
    return this.strategies[this.strategies.length - 1]
  }

  /**
   * Parse a binding path into its components
   * @param path - The binding path
   * @returns Parsed path components
   */
  parse(path: string): ParsedPath {
    const strategy = this.findStrategy(path)
    return strategy.parse(path)
  }

  /**
   * Resolve a value from the store using a binding path
   * @param path - The binding path (e.g., "object.username", "userExperience[0].employer")
   * @param store - The store object
   * @returns The resolved value, or undefined if not found
   */
  resolve(path: string, store: Record<string, any>): any {
    if (!path || !store) {
      return undefined
    }

    const strategy = this.findStrategy(path)
    return strategy.resolve(path, store)
  }

  /**
   * Set a value in the store using a binding path
   * @param path - The binding path
   * @param value - The value to set
   * @param store - The store object
   * @returns A new store object with the value set (immutable operation)
   */
  set(path: string, value: any, store: Record<string, any>): Record<string, any> {
    if (!path || !store) {
      return store
    }

    const strategy = this.findStrategy(path)
    return strategy.set(path, value, store)
  }

  /**
   * Get the root source name from a binding path
   * @param path - The binding path
   * @returns The root source name (e.g., "object" from "object.username")
   */
  getRootSource(path: string): string {
    const parsed = this.parse(path)
    return parsed.rootSource
  }

  /**
   * Get the relative path (without root source) from a binding path
   * @param path - The binding path
   * @returns The relative path (e.g., "username" from "object.username")
   */
  getRelativePath(path: string): string {
    const parsed = this.parse(path)
    return parsed.relativePath
  }
}

// Export a singleton instance for convenience
export const defaultBindingResolver = new BindingResolver()
