# Binding System Documentation

## Overview

The Binding System is a centralized abstraction for resolving and manipulating data paths in the form store. It handles complex nested structures including objects, arrays, and deeply nested combinations of both.

## Table of Contents

1. [Architecture](#architecture)
2. [Binding Paths](#binding-paths)
3. [How It Works](#how-it-works)
4. [Reading Data (Resolve)](#reading-data-resolve)
5. [Writing Data (Set)](#writing-data-set)
6. [Integration with Form System](#integration-with-form-system)
7. [Examples](#examples)
8. [Strategy Pattern](#strategy-pattern)

---

## Architecture

The binding system uses a **Strategy Pattern** to handle different types of binding paths:

```
BindingResolver (Orchestrator)
  ├── NestedListBindingStrategy (Multiple array indices)
  ├── ArrayBindingStrategy (Single array index)
  └── DotNotationBindingStrategy (Simple paths)
```

### Core Components

1. **`BindingResolver`** - Main class that coordinates path resolution
2. **`BindingStrategy`** - Interface for different path handling strategies
3. **`nestedValue.ts`** - Utility functions for deep object manipulation

---

## Binding Paths

A binding path is a string that describes the location of data in the store. The system supports three main patterns:

### 1. Simple Dot Notation
```
object.username
object.user.profile.name
queryString.userId
```

### 2. Single Array Index
```
userExperience[0].employer
items[1].name
array[5].property
```

### 3. Multiple Array Indices (Nested Lists)
```
object.userExperience[0].subItems[1].property
root.child.mylist[1].mylist2[2].value
data.level1[0].level2[0].level3[0].name
```

---

## How It Works

### Path Parsing

When a binding path is provided, the `BindingResolver`:

1. **Selects the appropriate strategy** based on path characteristics
2. **Parses the path** into components:
   - `rootSource`: The top-level key in the store (e.g., `"object"`, `"root"`)
   - `relativePath`: The remaining path after the root (e.g., `"userExperience[0].employer"`)
   - `arrayIndices`: All array indices found in the path

### Example: Path Parsing

```typescript
Path: "object.userExperience[0].employer"

Parsed:
{
  rootSource: "object",
  relativePath: "userExperience[0].employer",
  isArrayPath: true,
  arrayIndices: [0]
}
```

```typescript
Path: "root.child.mylist[1].mylist2[2].value"

Parsed:
{
  rootSource: "root",
  relativePath: "child.mylist[1].mylist2[2].value",
  isArrayPath: true,
  arrayIndices: [1, 2]
}
```

---

## Reading Data (Resolve)

### Process Flow

```
BindingResolver.resolve(path, store)
  ↓
Strategy.parse(path) → { rootSource, relativePath }
  ↓
Get root data: store[rootSource]
  ↓
getNestedValue(rootData, relativePath)
  ↓
Return value
```

### Step-by-Step: Reading `object.userExperience[0].employer`

1. **Strategy Selection**
   - Path contains `[0]` → `ArrayBindingStrategy` is selected

2. **Path Parsing**
   ```typescript
   rootSource = "object"
   relativePath = "userExperience[0].employer"
   ```

3. **Get Root Data**
   ```typescript
   rootData = store["object"]
   // Example: { userExperience: [{ employer: "Company A" }] }
   ```

4. **Navigate Relative Path**
   ```typescript
   // Normalize: "userExperience[0].employer" → "userExperience.0.employer"
   // Split: ["userExperience", "0", "employer"]
   // Navigate:
   //   rootData["userExperience"] → Array
   //   array[0] → Object
   //   object["employer"] → "Company A"
   ```

5. **Return Value**
   ```typescript
   return "Company A"
   ```

### Implementation Details

The `getNestedValue` function:
- Normalizes array indices: `[0]` → `.0`
- Splits the path by dots
- Iteratively navigates through the object/array structure
- Returns `undefined` if any part of the path doesn't exist

```typescript
// Example: getNestedValue(store.object, "userExperience[0].employer")
// 1. Normalize: "userExperience.0.employer"
// 2. Split: ["userExperience", "0", "employer"]
// 3. Navigate:
//    acc = store.object
//    acc = store.object["userExperience"]  // Array
//    acc = array[0]                         // Object
//    acc = object["employer"]               // "Company A"
```

---

## Writing Data (Set)

### Process Flow

```
BindingResolver.set(path, value, store)
  ↓
Strategy.parse(path) → { rootSource, relativePath }
  ↓
Get current root data: store[rootSource] || {}
  ↓
setNestedValue(rootData, relativePath, value)
  ↓
Return new store with updated root data
```

### Step-by-Step: Writing to `object.userExperience[0].employer`

1. **Strategy Selection & Parsing**
   ```typescript
   rootSource = "object"
   relativePath = "userExperience[0].employer"
   ```

2. **Get Current Root Data**
   ```typescript
   currentRootData = store["object"] || {}
   // Example: { userExperience: [{ employer: "Old Company" }] }
   ```

3. **Deep Clone (Immutable Update)**
   ```typescript
   clonedData = JSON.parse(JSON.stringify(currentRootData))
   ```

4. **Navigate and Create Intermediate Structures**
   ```typescript
   // Normalize: "userExperience[0].employer" → "userExperience.0.employer"
   // Split: ["userExperience", "0", "employer"]
   
   // Navigate and create if needed:
   //   clonedData["userExperience"] → Ensure array exists
   //   array[0] → Ensure object exists at index 0
   //   object["employer"] → Set value
   ```

5. **Set the Value**
   ```typescript
   clonedData.userExperience[0].employer = "New Company"
   ```

6. **Return New Store**
   ```typescript
   return {
     ...store,
     object: clonedData
   }
   ```

### Creating Intermediate Structures

The `setNestedValue` function automatically creates missing intermediate structures:

```typescript
// Setting: "root.child.mylist[1].mylist2[2].value" = "test"
// Creates:
{
  root: {
    child: {
      mylist: [
        {},                    // Index 0 (empty object)
        {                      // Index 1
          mylist2: [
            {},                // Index 0
            {},                // Index 1
            {                  // Index 2
              value: "test"
            }
          ]
        }
      ]
    }
  }
}
```

### Array Extension Logic

When setting a value at an array index that doesn't exist:

```typescript
// If array.length <= index:
//   - Extend array to required length
//   - Fill with empty objects {} or arrays [] based on next key type
//   - Set the final value
```

---

## Integration with Form System

### In DynamicForm Component

When a user changes a field value:

```typescript
handleFieldChange(bindingPath, newValue) {
  setStore((prev) => {
    return bindingResolver.set(bindingPath, newValue, prev)
  })
}
```

**Example:**
```typescript
// User types in "employer" field
bindingPath = "object.userExperience[0].employer"
newValue = "Tech Corp"

// BindingResolver handles:
// 1. Parse path
// 2. Get store.object
// 3. Navigate to userExperience[0].employer
// 4. Set value
// 5. Return new store
```

### In useStore Hook

When syncing List field data from API:

```typescript
// API returns data for listSource
// Need to sync to binding path
config.fields.forEach((field) => {
  if (field.fieldType === 'List' && field.listSource === source.sourceName) {
    const bindingPath = field.binding  // e.g., "object.userExperience"
    const arrayData = /* extracted from API response */
    
    // Use BindingResolver to set the array
    newStore = bindingResolver.set(bindingPath, arrayData, newStore)
  }
})
```

### Reading Field Values

```typescript
// Get value for a field
const fieldValue = bindingResolver.resolve(field.binding, store)

// Or using getNestedValue directly:
const fieldValue = getNestedValue(store, field.binding)
```

---

## Examples

### Example 1: Simple Field Update

```typescript
// Store state
const store = {
  object: {
    username: "john_doe",
    email: "john@example.com"
  }
}

// Update username
const newStore = bindingResolver.set("object.username", "jane_doe", store)

// Result
{
  object: {
    username: "jane_doe",  // Updated
    email: "john@example.com"
  }
}
```

### Example 2: Array Item Update

```typescript
// Store state
const store = {
  object: {
    userExperience: [
      { employer: "Company A", position: "Developer" },
      { employer: "Company B", position: "Senior Developer" }
    ]
  }
}

// Update first experience
const newStore = bindingResolver.set(
  "object.userExperience[0].employer",
  "Tech Corp",
  store
)

// Result
{
  object: {
    userExperience: [
      { employer: "Tech Corp", position: "Developer" },  // Updated
      { employer: "Company B", position: "Senior Developer" }
    ]
  }
}
```

### Example 3: Deeply Nested Structure

```typescript
// Store state
const store = {
  root: {
    child: {
      mylist: [
        {},
        {
          mylist2: [
            {},
            {},
            { value: "original" }
          ]
        }
      ]
    }
  }
}

// Update deeply nested value
const newStore = bindingResolver.set(
  "root.child.mylist[1].mylist2[2].value",
  "updated",
  store
)

// Result
{
  root: {
    child: {
      mylist: [
        {},
        {
          mylist2: [
            {},
            {},
            { value: "updated" }  // Updated
          ]
        }
      ]
    }
  }
}
```

### Example 4: Creating New Structure

```typescript
// Empty store
const store = {
  object: {}
}

// Set deeply nested value (creates all intermediate structures)
const newStore = bindingResolver.set(
  "object.userExperience[0].employer",
  "New Company",
  store
)

// Result (all structures created automatically)
{
  object: {
    userExperience: [
      { employer: "New Company" }  // Created
    ]
  }
}
```

---

## Strategy Pattern

### Strategy Selection Order

Strategies are checked in order of specificity (most specific first):

1. **NestedListBindingStrategy** - Multiple array indices (`[1].mylist2[2]`)
2. **ArrayBindingStrategy** - Single array index (`[0]`)
3. **DotNotationBindingStrategy** - Simple paths (fallback)

### Strategy Interface

```typescript
interface BindingStrategy {
  canHandle(path: string): boolean
  parse(path: string): ParsedPath
  resolve(path: string, store: Record<string, any>): any
  set(path: string, value: any, store: Record<string, any>): Record<string, any>
}
```

### Custom Strategies

You can register custom strategies:

```typescript
class CustomBindingStrategy implements BindingStrategy {
  canHandle(path: string): boolean {
    return path.startsWith('custom:')
  }
  
  parse(path: string): ParsedPath {
    // Custom parsing logic
  }
  
  resolve(path: string, store: Record<string, any>): any {
    // Custom resolution logic
  }
  
  set(path: string, value: any, store: Record<string, any>): Record<string, any> {
    // Custom set logic
  }
}

// Register
const resolver = new BindingResolver()
resolver.registerStrategy(new CustomBindingStrategy())
```

---

## Key Features

### ✅ Immutability

All `set` operations return a new store object, preserving immutability:

```typescript
const newStore = bindingResolver.set(path, value, store)
// store is unchanged
// newStore is a new object
```

### ✅ Automatic Structure Creation

Missing intermediate objects and arrays are created automatically:

```typescript
// Setting "a.b[0].c" on empty object creates:
{
  a: {
    b: [
      { c: value }
    ]
  }
}
```

### ✅ Array Extension

Arrays are automatically extended to accommodate indices:

```typescript
// Setting "array[5].value" extends array to length 6
// Fills indices 0-4 with empty objects if needed
```

### ✅ Type Safety

The system handles both objects and arrays correctly:

```typescript
// Detects if next key is array index
// Creates appropriate structure ([] or {})
```

---

## Performance Considerations

1. **Memoization**: `BindingResolver` instances are memoized in components
2. **Strategy Caching**: Strategy selection is fast (O(n) where n = number of strategies)
3. **Deep Cloning**: Uses `JSON.parse(JSON.stringify())` for immutability
   - Consider using a library like `immer` for large objects if performance becomes an issue

---

## Error Handling

### Non-existent Paths

- **Reading**: Returns `undefined` if any part of the path doesn't exist
- **Writing**: Creates all intermediate structures automatically

### Invalid Paths

- **Array index on non-array**: Returns original object (doesn't throw)
- **Property on undefined**: Returns `undefined` when reading

---

## Best Practices

1. **Use consistent root sources**: Prefer `object` for form data
2. **Keep paths readable**: Use descriptive property names
3. **Avoid deep nesting**: Consider flattening if nesting exceeds 3-4 levels
4. **Test edge cases**: Test with empty stores, missing properties, etc.

---

## Related Files

- `form-design-lib/src/core/BindingResolver.ts` - Main resolver class
- `form-design-lib/src/core/binding/strategies/` - Strategy implementations
- `form-design-lib/src/utils/nestedValue.ts` - Core utility functions
- `form-design-lib/src/components/DynamicForm.tsx` - Integration point
- `form-design-lib/src/hooks/useStore.ts` - Store management

---

## Summary

The Binding System provides a robust, flexible way to:
- **Read** data from deeply nested store structures
- **Write** data while maintaining immutability
- **Handle** complex paths with multiple array indices
- **Create** intermediate structures automatically
- **Support** extensibility through custom strategies

It abstracts away the complexity of path parsing and navigation, making it easy to work with complex form data structures.
