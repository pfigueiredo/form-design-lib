# Fix Explanation: useStore Hook Infinite Loop

## Problem

The original `useStore` hook had a critical infinite loop issue on **line 155**:

```typescript
useEffect(() => {
  // ... fetch logic that reads from store and updates store
}, [store, config.Sources, api])  // ❌ PROBLEM: store in dependencies
```

### Why This Causes Infinite Loops

1. **The Cycle:**
   ```
   store changes 
   → useEffect triggers (because store is in deps)
   → API call executes
   → setStore() updates store (line 138-143)
   → store changes again
   → useEffect triggers again
   → Infinite loop! 🔄
   ```

2. **Additional Issues:**
   - `api` object reference changes on every render (line 85) because `defaultApiProvider` is created inline
   - This causes the effect to run unnecessarily even when nothing changed

## Solution

### 1. Use Refs for Reading Store State

Instead of reading directly from `store` (which triggers re-renders), we use a ref:

```typescript
const storeRef = useRef<Record<string, any>>(store)

// Update ref whenever store changes (doesn't trigger effects)
useEffect(() => {
  storeRef.current = store
}, [store])

// Read from ref instead of store
const value = getNestedValue(storeRef.current, paramPath)  // ✅
```

**Benefits:**
- Reading from `storeRef.current` doesn't create dependencies
- We always have the latest store value
- No infinite loops from reading

### 2. Stabilize API Provider Reference

Use `useMemo` to prevent the API provider from being recreated on every render:

```typescript
const defaultApiProvider: ApiProvider = useMemo(
  () => ({
    call: async (endpoint: string, method: string = 'GET') => {
      // ... implementation
    },
  }),
  []  // Empty deps - created once
)

const api = useMemo(
  () => apiProvider || defaultApiProvider,
  [apiProvider, defaultApiProvider]
)
```

**Benefits:**
- API reference stays stable unless `apiProvider` prop actually changes
- Prevents unnecessary effect re-runs

### 3. Split Effects for Better Control

We split the logic into two effects:

**Effect 1:** Initial fetch when config changes
```typescript
useEffect(() => {
  checkAndFetchSources()
}, [checkAndFetchSources])  // Only depends on stable callback
```

**Effect 2:** Re-check when store changes (for dependent sources)
```typescript
useEffect(() => {
  const timeoutId = setTimeout(() => {
    checkAndFetchSources()
  }, 100)  // Debounce to batch updates
  return () => clearTimeout(timeoutId)
}, [store, checkAndFetchSources])  // Store here is OK because we debounce
```

**Benefits:**
- Clear separation of concerns
- Debouncing prevents rapid-fire API calls
- Only re-checks when store actually changes

### 4. Extract Logic to useCallback

Extract the fetch logic to a `useCallback` to make it stable:

```typescript
const checkAndFetchSources = useCallback(async () => {
  // ... fetch logic using storeRef.current
}, [config.Sources, api])  // Only depends on stable values
```

**Benefits:**
- Function reference is stable unless dependencies change
- Can be safely used in effect dependencies

## Key Changes Summary

| Before | After | Why |
|--------|-------|-----|
| `getNestedValue(store, path)` | `getNestedValue(storeRef.current, path)` | Avoid dependency on store |
| `const api = apiProvider \|\| defaultApiProvider` | `useMemo(() => apiProvider \|\| defaultApiProvider, [...])` | Stabilize reference |
| `}, [store, config.Sources, api])` | `}, [checkAndFetchSources])` | Remove store from deps |
| Single effect | Two effects (initial + dependent) | Better control and debouncing |

## Testing the Fix

To verify the fix works:

1. **No Infinite Loops:**
   - Open browser DevTools
   - Watch Network tab
   - API calls should only happen when:
     - Component mounts
     - Config changes
     - Parameter values change (debounced)

2. **Dependent Sources Still Work:**
   - Change a field that triggers a dependent API call
   - The dependent source should fetch after a short delay
   - Should only fetch once per unique parameter combination

3. **Performance:**
   - No excessive re-renders
   - API calls are properly cached (prevParamsRef)
   - Debouncing prevents rapid-fire calls

## Result

✅ **Fixed:** No more infinite loops  
✅ **Fixed:** API provider reference is stable  
✅ **Fixed:** Dependent sources still work correctly  
✅ **Improved:** Better performance with debouncing  
✅ **Improved:** Clearer code structure
