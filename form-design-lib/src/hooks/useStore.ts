import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { FormConfig, ApiProvider } from '../types'
import { getNestedValue } from '../utils/nestedValue'
import { BindingResolver } from '../core/BindingResolver'

export interface ApiError {
  sourceName: string
  endpoint: string
  message: string
  error: unknown
  timestamp: number
  retryCount: number
}

export interface UseStoreReturn {
  store: Record<string, any>
  setStore: React.Dispatch<React.SetStateAction<Record<string, any>>>
  loadingStates: Record<string, boolean>
  errors: Record<string, ApiError>
  retrySource: (sourceName: string) => Promise<void>
  clearError: (sourceName: string) => void
}

export interface UseStoreOptions {
  config: FormConfig
  apiProvider: ApiProvider
  maxRetries?: number
  retryDelay?: number
  onError?: (error: ApiError) => void
}

/**
 * Custom hook that manages form state, initialization, and data dependencies.
 * Handles API calls based on the configuration sources.
 * 
 * @param config - Form configuration
 * @param apiProvider - Required API provider implementation (must be provided by consumer)
 * 
 * FIXED: Removed infinite loop risk by:
 * - Using refs to track store state for reading without triggering re-renders
 * - Stabilizing API provider reference with useMemo
 * - Only triggering effects based on config changes, not store changes
 */
export function useStore({ 
  config, 
  apiProvider, 
  maxRetries = 3,
  retryDelay = 1000,
  onError
}: UseStoreOptions): UseStoreReturn {
  const [store, setStore] = useState<Record<string, any>>({})
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, ApiError>>({})

  // Use ref to track current store state for reading without causing re-renders
  const storeRef = useRef<Record<string, any>>(store)
  
  // Update ref whenever store changes
  useEffect(() => {
    storeRef.current = store
  }, [store])

  // To prevent infinite loops, we track the last params used to fetch a source
  const prevParamsRef = useRef<Record<string, string>>({})
  
  // Track retry counts for each source
  const retryCountsRef = useRef<Record<string, number>>({})

  // Track in-flight requests to prevent duplicate concurrent fetches
  const inFlightRef = useRef<Set<string>>(new Set())

  // Stabilize API provider reference to prevent unnecessary re-renders
  const api = useMemo(() => apiProvider, [apiProvider])

  // Create BindingResolver instance (memoized for performance)
  const bindingResolver = useMemo(() => new BindingResolver(), [])

  // Effect 1: Initialize store structure based on sources
  // Only initialize if store is empty to avoid triggering Effect 3 unnecessarily
  useEffect(() => {
    const initialStore: Record<string, any> = {}
    config.sources.forEach((source) => {
      initialStore[source.sourceName] = source.sourceName === 'object' ? {} : []
    })
    setStore((prev) => {
      // Only update if store is empty or missing required keys
      const needsInit = Object.keys(prev).length === 0 || 
        config.sources.some(source => !(source.sourceName in prev))
      return needsInit ? { ...initialStore, ...prev } : prev
    })
  }, [config.sources])

  // Helper function to check and fetch sources
  // Extracted to avoid recreating on every render
  const checkAndFetchSources = useCallback(async () => {
    const debug = config.debug ?? false
    const fetchStartTime = debug ? Date.now() : 0
    const fetchOrder: string[] = []

    for (const source of config.sources) {
      if (source.sourceType !== 'API') continue

      let url = source.endpoint
      let shouldFetch = true
      const resolvedParams: Record<string, any> = {}

      // Resolve Parameters
      // FIXED: Use storeRef.current instead of store to avoid dependency issues
      if (source.parameters) {
        Object.entries(source.parameters).forEach(([paramName, paramPath]) => {
          const value = getNestedValue(storeRef.current, paramPath)
          resolvedParams[paramName] = value

          // If a required parameter is missing/undefined, we cannot fetch this source yet
          if (value === undefined || value === null || value === '') {
            shouldFetch = false
          } else {
            url = url.replace(`{${paramName}}`, value)
            if (url.includes('{id}')) {
              url = url.replace('{id}', value)
            }
          }
        })
      }

      if (!shouldFetch) {
        if (debug) {
          console.log(
            `[FormDebug] ⏸️  Skipping ${source.sourceName}: Missing required parameters`,
            source.parameters ? { parameters: resolvedParams } : ''
          )
        }
        continue
      }

      // Check cache signature
      const paramsSignature = JSON.stringify({ url, ...resolvedParams })
      if (prevParamsRef.current[source.sourceName] === paramsSignature) {
        if (debug) {
          console.log(
            `[FormDebug] 💾 Skipping ${source.sourceName}: Already cached`,
            { url, paramsSignature }
          )
        }
        continue
      }

      // Check if this source is already being fetched (prevent duplicate concurrent fetches)
      if (inFlightRef.current.has(source.sourceName)) {
        if (debug) {
          console.log(
            `[FormDebug] ⏳ Skipping ${source.sourceName}: Already in flight`,
            { url }
          )
        }
        continue
      }

      // Mark as in-flight
      inFlightRef.current.add(source.sourceName)

      // Perform Fetch
      const fetchStart = debug ? Date.now() : 0
      if (debug) {
        fetchOrder.push(source.sourceName)
        console.log(
          `[FormDebug] 🔄 Fetching ${source.sourceName}...`,
          {
            order: fetchOrder.length,
            url,
            parameters: Object.keys(resolvedParams).length > 0 ? resolvedParams : undefined,
            timestamp: new Date().toISOString(),
          }
        )
      }

      setLoadingStates((prev) => ({ ...prev, [source.sourceName]: true }))
      
      // Clear any existing error for this source
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[source.sourceName]
        return newErrors
      })

      try {
        const data = await api.call(url)
        const fetchDuration = debug ? Date.now() - fetchStart : 0

        if (debug) {
          console.log(
            `[FormDebug] ✅ Fetched ${source.sourceName} (${fetchDuration}ms)`,
            {
              order: fetchOrder.length,
              url,
              dataSize: Array.isArray(data) ? `${data.length} items` : typeof data === 'object' ? `${Object.keys(data).length} properties` : 'primitive',
              dataPreview: Array.isArray(data) 
                ? `Array[${data.length}]` 
                : typeof data === 'object' && data !== null
                ? `Object{${Object.keys(data).slice(0, 3).join(', ')}${Object.keys(data).length > 3 ? '...' : ''}}`
                : String(data).substring(0, 50),
            }
          )
        }

        setStore((prev) => {
          // Find the main object source name (typically 'object', but could be different)
          // This is the source that stores form data (not option lists)
          const mainObjectSourceName = config.sources.find(
            (s) => s.sourceName === 'object' || (s.sourceType === 'API' && !s.parameters)
          )?.sourceName || 'object'

          if (source.sourceName === mainObjectSourceName) {
            // Check if there are List fields that need property mapping
            // If API returns data with a property that should be mapped to a List field binding
            const mappedData = { ...data }
            
            // Find List fields that use this source or need property mapping
            config.fields.forEach((field) => {
              if (field.fieldType === 'List' && field.binding && field.binding.startsWith(`${mainObjectSourceName}.`)) {
                // Extract the relative path from binding (e.g., "userExperience" from "object.userExperience")
                // or "userExperience[0].subItems" for nested lists
                const relativePath = field.binding.replace(`${mainObjectSourceName}.`, '')
                
                // Check if the API data has a property that matches the listSource name
                // but should be mapped to the binding property name
                if (field.listSource && data[field.listSource] && Array.isArray(data[field.listSource])) {
                  // For top-level properties, map directly
                  // For nested paths, we'll handle them differently
                  if (!relativePath.includes('[')) {
                    // Simple top-level property mapping
                    mappedData[relativePath] = data[field.listSource]
                    // Remove the original property to avoid duplication
                    delete mappedData[field.listSource]
                  }
                }
              }
            })
            
            return { ...prev, [source.sourceName]: { ...prev[source.sourceName], ...mappedData } }
          }
          // For other sources, store the data directly
          // Note: $id will be added by DynamicForm for List fields only, not for option lists
          let newStore = { ...prev, [source.sourceName]: data }
          
          // Check if this source is used as a listSource for any List field
          // If so, sync the data to the binding path (supports nested paths)
          config.fields.forEach((field) => {
            if (field.fieldType === 'List' && field.listSource === source.sourceName && field.binding) {
              // Get the array data (handle both direct array and object with array property)
              let arrayData = data
              if (data && typeof data === 'object' && !Array.isArray(data)) {
                // If it's an object, find the array property
                const arrayKey = Object.keys(data).find(key => Array.isArray(data[key]))
                arrayData = arrayKey ? data[arrayKey] : []
              }
              
              // Only sync if we have valid array data
              if (Array.isArray(arrayData) && arrayData.length > 0) {
                // Use BindingResolver to set the value at the binding path
                // This handles all path parsing and nested updates automatically
                const bindingPath = field.binding
                const parsed = bindingResolver.parse(bindingPath)
                
                // Only sync if the root source exists in the store or is the main object source
                if (parsed.rootSource in newStore || parsed.rootSource === mainObjectSourceName) {
                  // Use BindingResolver.set to handle nested paths (supports arbitrary depth)
                  newStore = bindingResolver.set(bindingPath, arrayData, newStore)
                }
              }
            }
          })
          
          return newStore
        })

        prevParamsRef.current[source.sourceName] = paramsSignature
        retryCountsRef.current[source.sourceName] = 0 // Reset retry count on success
      } catch (err) {
        const fetchDuration = debug ? Date.now() - fetchStart : 0
        const currentRetryCount = retryCountsRef.current[source.sourceName] || 0

        if (debug) {
          console.error(
            `[FormDebug] ❌ Failed to fetch ${source.sourceName} (${fetchDuration}ms)`,
            {
              order: fetchOrder.length,
              url,
              error: err instanceof Error ? err.message : 'Unknown error',
              retryCount: currentRetryCount,
              willRetry: currentRetryCount < maxRetries,
            }
          )
        }
        
        // Create error object
        const apiError: ApiError = {
          sourceName: source.sourceName,
          endpoint: url,
          message: err instanceof Error ? err.message : 'Unknown error occurred',
          error: err,
          timestamp: Date.now(),
          retryCount: currentRetryCount,
        }

        // Store the error
        setErrors((prev) => ({ ...prev, [source.sourceName]: apiError }))

        // Call error callback if provided
        if (onError) {
          onError(apiError)
        }

        // Retry logic with exponential backoff
        if (currentRetryCount < maxRetries) {
          retryCountsRef.current[source.sourceName] = currentRetryCount + 1
          
          // Exponential backoff: delay * 2^retryCount
          const delay = retryDelay * Math.pow(2, currentRetryCount)
          
          // Schedule retry - clear cache signature to force re-fetch
          setTimeout(() => {
            // Clear the cache signature to force a re-fetch
            delete prevParamsRef.current[source.sourceName]
            // Remove from in-flight so retry can proceed
            inFlightRef.current.delete(source.sourceName)
            // Trigger re-fetch
            checkAndFetchSources()
          }, delay)
        } else {
          // Max retries reached, log error
          console.error(`Failed to load ${source.sourceName} after ${maxRetries} retries`, err)
          retryCountsRef.current[source.sourceName] = 0 // Reset for manual retry
        }
      } finally {
        // Remove from in-flight when done (success or error)
        inFlightRef.current.delete(source.sourceName)
        setLoadingStates((prev) => ({ ...prev, [source.sourceName]: false }))
      }
    }

    // Log fetch summary if debug is enabled
    if (debug && fetchOrder.length > 0) {
      const totalDuration = Date.now() - fetchStartTime
      console.log(
        `[FormDebug] 📊 Fetch Summary`,
        {
          totalSources: fetchOrder.length,
          fetchOrder: fetchOrder,
          totalDuration: `${totalDuration}ms`,
          timestamp: new Date().toISOString(),
        }
      )
    }
  }, [config.sources, config.fields, config.debug, api, maxRetries, retryDelay, onError, bindingResolver])

  // Effect 2: Data Source Engine - Initial fetch when config changes
  // FIXED: Removed 'store' from dependencies to prevent infinite loops
  useEffect(() => {
    checkAndFetchSources()
  }, [checkAndFetchSources])

  // Effect 3: Re-check sources when store values change (for dependent sources)
  // This effect runs when store changes, but uses refs to avoid infinite loops
  // IMPROVED: Only re-check if dependent source parameters actually changed
  useEffect(() => {
    // Only re-check sources that have parameters (dependent sources)
    const dependentSources = config.sources.filter(
      (source) => source.sourceType === 'API' && source.parameters
    )

    if (dependentSources.length === 0) return

    // Check if any dependent source actually needs to be re-fetched
    // by checking if their parameters have changed from the cached signature
    let needsRefetch = false
    for (const source of dependentSources) {
      if (!source.parameters) continue
      
      // Build current signature
      let url = source.endpoint
      const resolvedParams: Record<string, any> = {}
      let allParamsResolved = true
      
      for (const [paramName, paramPath] of Object.entries(source.parameters)) {
        const value = getNestedValue(storeRef.current, paramPath)
        resolvedParams[paramName] = value
        if (value === undefined || value === null || value === '') {
          allParamsResolved = false
          break
        } else {
          url = url.replace(`{${paramName}}`, value)
          if (url.includes('{id}')) {
            url = url.replace('{id}', value)
          }
        }
      }
      
      // Only check if all parameters are resolved
      if (allParamsResolved) {
        const currentSignature = JSON.stringify({ url, ...resolvedParams })
        const prevSignature = prevParamsRef.current[source.sourceName]
        
        // If signature changed and source is not in-flight, we need to refetch
        if (prevSignature !== currentSignature && !inFlightRef.current.has(source.sourceName)) {
          needsRefetch = true
          break
        }
      }
    }

    if (!needsRefetch) return

    // Small delay to batch multiple store updates
    const timeoutId = setTimeout(() => {
      checkAndFetchSources()
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [store, checkAndFetchSources])

  // Manual retry function
  const retrySource = useCallback(async (sourceName: string) => {
    const source = config.sources.find((s) => s.sourceName === sourceName)
    if (!source || source.sourceType !== 'API') return

    // Reset retry count for manual retry
    retryCountsRef.current[sourceName] = 0
    
    // Clear error
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[sourceName]
      return newErrors
    })

    // Trigger fetch
      await checkAndFetchSources()
    }, [checkAndFetchSources, config.sources])

  // Clear error function
  const clearError = useCallback((sourceName: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[sourceName]
      return newErrors
    })
    retryCountsRef.current[sourceName] = 0
  }, [])

  return { store, setStore, loadingStates, errors, retrySource, clearError }
}
