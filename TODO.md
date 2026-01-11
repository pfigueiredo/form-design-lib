# TODO - Form Design Library

This document tracks all tasks and improvements needed for the form design library, organized by priority.

## 🔴 High Priority

### 1. Fix useStore Hook Infinite Loop Risk
- [x] Remove `store` from dependency array in `useStore.ts` (line 155)
- [x] Use refs or callbacks for comparison instead of direct store dependency
- [x] Add proper dependency tracking for API calls
- [x] Test that API calls don't trigger infinite loops (automated tests implemented)

**Files:** 
- `form-design-lib/src/hooks/useStore.ts` ✅
- `form-design-lib/src/hooks/__tests__/useStore.test.ts` ✅

### 2. Improve Type Safety
- [ ] Replace `Record<string, any>` with proper generic types
- [ ] Add generic type parameter to `ApiProvider.call()` method
- [ ] Create discriminated union types for `FormField` based on `fieldType`
- [ ] Remove or minimize `any` type usage throughout codebase
- [ ] Add type guards for runtime type checking

**Files:**
- `form-design-lib/src/types.ts`
- `form-design-lib/src/hooks/useStore.ts`
- `form-design-lib/src/components/DynamicForm.tsx`
- `form-design-lib/src/components/FormField.tsx`

### 3. Add Error Handling
- [x] Add error state to `useStore` hook return value
- [x] Surface API errors to consumers of the hook
- [x] Add error boundaries for component error handling
- [x] Add error callback prop to `DynamicForm` component
- [x] Implement proper error messages for users
- [x] Add retry logic for failed API calls

**Files:**
- `form-design-lib/src/hooks/useStore.ts` ✅
- `form-design-lib/src/components/DynamicForm.tsx` ✅
- `form-design-lib/src/components/ErrorBoundary.tsx` ✅

### 4. Fix FormField Key Prop
- [x] Replace `key={idx}` with composite key that handles duplicate bindings
- [x] Use `section-fieldName-fieldType-binding-index` format for uniqueness
- [x] Add validation warning for duplicate bindings (development mode)
- [x] Memoize sections computation for performance

**Files:** 
- `form-design-lib/src/components/DynamicForm.tsx` ✅

**Note:** Duplicate bindings are allowed (e.g., textbox and display field can share binding), so keys use composite format to ensure uniqueness.

---

## 🟡 Medium Priority

### 5. Extract Mock API Provider
- [x] Remove default API provider from `useStore.ts` (moved to demo-app)
- [x] Make `apiProvider` required (not optional) in `UseStoreOptions` and `DynamicFormProps`
- [x] Update `useStore` to require `apiProvider` parameter
- [x] Update documentation to reflect required API provider
- [x] Demo-app already has mock API provider implementation

**Files:**
- `form-design-lib/src/hooks/useStore.ts` ✅
- `form-design-lib/src/components/DynamicForm.tsx` ✅
- `form-design-lib/README.md` ✅
- `demo-app/src/mockApi.ts` (already exists)

### 6. Performance Optimizations
- [ ] Memoize `sections` computation in `DynamicForm` using `useMemo`
- [ ] Memoize field components with `React.memo`
- [ ] Optimize `useStore` to prevent unnecessary re-renders
- [ ] Add request deduplication for API calls
- [ ] Implement request caching strategy
- [ ] Add debouncing for dependent API calls

**Files:**
- `form-design-lib/src/components/DynamicForm.tsx`
- `form-design-lib/src/components/FormField.tsx`
- `form-design-lib/src/hooks/useStore.ts`

### 7. Improve Validation
- [x] Add validation on blur/change events (not just on submit)
- [x] Add async validation support
- [x] Make error messages configurable
- [x] Add custom validation function support
- [x] Add validation for Date fields (min/max dates)
- [x] Add validation for Number fields (min/max values)

**Files:**
- `form-design-lib/src/components/DynamicForm.tsx` ✅
- `form-design-lib/src/types.ts` ✅
- `form-design-lib/src/components/fields/*.tsx` ✅

**Features Added:**
- `validateOn` prop to control when validation triggers (onChange, onBlur, onSubmit)
- `customValidator` function support (sync and async)
- `errorMessages` object for customizing all error messages
- `minDate`/`maxDate` for Date fields (supports 'today' keyword)
- `min`/`max` for Number fields (ready for future Number field type)
- Real-time validation on change/blur events
- Async validation support with loading states

### 8. Add onSubmit Callback
- [ ] Add `onSubmit` prop to `DynamicFormProps`
- [ ] Add `onValidationError` prop for error handling
- [ ] Replace hardcoded `console.log` with callback
- [ ] Make success timeout configurable
- [ ] Add loading state during submission

**File:** `form-design-lib/src/components/DynamicForm.tsx`

### 9. Improve Utility Functions
- [ ] Replace `JSON.parse(JSON.stringify())` with proper deep clone
- [ ] Add path validation in `getNestedValue` and `setNestedValue`
- [ ] Extract queryString handling to configurable provider
- [ ] Add error handling for invalid paths
- [ ] Handle edge cases (empty strings, special characters)

**File:** `form-design-lib/src/utils/nestedValue.ts`

### 10. Grid Size Validation
- [ ] Add validation for `gridSize` (must be 1-12)
- [ ] Clamp gridSize values in `FormField` component
- [ ] Add TypeScript type for grid size (1-12)
- [ ] Add runtime validation with helpful error messages

**Files:**
- `form-design-lib/src/components/FormField.tsx`
- `form-design-lib/src/types.ts`

---

## 🟢 Low Priority

### 11. Add Test Coverage
- [x] Set up testing framework (Vitest)
- [x] Add unit tests for `useStore` hook (infinite loop prevention tests)
- [ ] Add unit tests for utility functions (`nestedValue.ts`)
- [ ] Add component tests for `FormField` components
- [ ] Add integration tests for `DynamicForm`
- [ ] Add TypeScript type tests with `tsd`
- [ ] Add E2E tests for form submission flow
- [x] Set up test coverage reporting

**Files:** 
- `form-design-lib/vitest.config.ts` ✅
- `form-design-lib/src/test/setup.ts` ✅
- `form-design-lib/src/hooks/__tests__/useStore.test.ts` ✅

### 12. Improve Documentation
- [ ] Add JSDoc comments to all exported functions
- [ ] Add JSDoc comments to all exported components
- [ ] Add JSDoc comments to all exported hooks
- [ ] Generate API documentation with TypeDoc
- [ ] Add code examples for each component in README
- [ ] Add troubleshooting section to README
- [ ] Add migration guide for future breaking changes

**Files:**
- All source files
- `form-design-lib/README.md`

### 13. CSS Improvements
- [ ] Convert hardcoded colors to CSS variables
- [ ] Convert hardcoded spacing to CSS variables
- [ ] Add theming support
- [ ] Generate all grid classes statically (1-12)
- [ ] Add dark mode support
- [ ] Improve responsive design
- [ ] Add CSS custom properties documentation

**Files:**
- `form-design-lib/src/components/FormField.css`
- `form-design-lib/src/components/DynamicForm.css`

### 14. Security Enhancements
- [x] Add XSS protection (sanitize field values)
- [x] Add endpoint URL validation (prevent SSRF)
- [x] Sanitize JSON output in debug panel
- [x] Add Content Security Policy considerations
- [x] Review and secure API provider implementation

**Files:**
- `form-design-lib/src/components/DynamicForm.tsx` ✅
- `form-design-lib/src/hooks/useStore.ts` ✅
- `form-design-lib/src/utils/nestedValue.ts` ✅
- `form-design-lib/src/utils/security.ts` ✅
- `form-design-lib/SECURITY.md` ✅

**Features Added:**
- `sanitizeString()` and `sanitizeObject()` for XSS protection
- `validateEndpointUrl()` for SSRF prevention with hostname whitelist support
- `sanitizeJsonForDisplay()` for safe debug panel output
- `isValidPath()` for path traversal prevention
- CSP recommendations and helper functions
- Security options in `DynamicForm` and `useStore` hooks
- Comprehensive security documentation

### 15. Build & Distribution Improvements
- [ ] Make CSS import optional (separate from main export)
- [ ] Improve tree shaking support
- [ ] Add sideEffects configuration to package.json
- [ ] Optimize bundle size
- [ ] Add source maps for debugging
- [ ] Add different build targets (ESM, CJS, UMD)

**Files:**
- `form-design-lib/src/index.ts`
- `form-design-lib/package.json`
- `form-design-lib/vite.config.ts`

### 16. Add Request Management
- [ ] Implement request cancellation with AbortController
- [ ] Add request timeout handling
- [ ] Add request retry logic with exponential backoff
- [ ] Add request queue management
- [ ] Add concurrent request limiting

**File:** `form-design-lib/src/hooks/useStore.ts`

### 17. Enhance Field Types
- [x] Add Number field type
- [x] Add Textarea field type
- [x] Add Radio button field type
- [x] Add File upload field type
- [x] Add Multi-select dropdown field type
- [x] Add Date range picker field type

**Files:**
- `form-design-lib/src/components/fields/NumberField.tsx` ✅
- `form-design-lib/src/components/fields/TextareaField.tsx` ✅
- `form-design-lib/src/components/fields/RadioField.tsx` ✅
- `form-design-lib/src/components/fields/FileField.tsx` ✅
- `form-design-lib/src/components/fields/MultiSelectField.tsx` ✅
- `form-design-lib/src/components/fields/DateRangeField.tsx` ✅
- `form-design-lib/src/types.ts` ✅
- `form-design-lib/src/components/FormField.tsx` ✅
- `form-design-lib/src/components/FormField.css` ✅

**Features Added:**
- **Number**: Supports min/max validation, step control
- **Textarea**: Multi-line text input with min/max length validation
- **Radio**: Single selection from options (inline or vertical layout)
- **File**: File upload with accept types, multiple files, max file size validation
- **MultiSelect**: Multiple selection from options with max selections limit
- **DateRange**: Start and end date picker with range validation
- All new fields support validation, error messages, and onBlur/onChange events

### 18. Add Form Features
- [x] Add form reset functionality
- [x] Add form state persistence (localStorage)
- [x] Add form state restoration
- [x] Add conditional field visibility
- [x] Add field dependencies (show/hide based on other fields)
- [x] Add field grouping/collapsible sections

**Files:**
- `form-design-lib/src/components/DynamicForm.tsx` ✅
- `form-design-lib/src/types.ts` ✅
- `form-design-lib/src/components/DynamicForm.css` ✅

**Features Added:**
- **Form Reset**: Reset button that restores form to initial state or clears all fields
- **State Persistence**: Automatic localStorage persistence of form data (configurable via `persistState`)
- **State Restoration**: Automatic restoration of form state from localStorage on mount
- **Conditional Visibility**: Fields can be shown/hidden using `visible` property (boolean or function)
- **Field Dependencies**: Fields can depend on other fields using `dependsOn` with value matching, array matching, or custom conditions
- **Collapsible Sections**: Sections can be collapsed/expanded with toggle buttons (configurable via `collapsibleSections` and `defaultSectionState`)
- All features are configurable and work together seamlessly

### 19. Improve Developer Experience
- [ ] Add TypeScript strict mode
- [ ] Add ESLint configuration
- [ ] Add Prettier configuration
- [ ] Add pre-commit hooks (Husky)
- [ ] Add lint-staged for code quality
- [ ] Add commit message linting
- [ ] Add changelog generation

**Files:** Configuration files to be created

### 20. Add Examples & Demos
- [ ] Create example for each field type
- [ ] Create example for API integration
- [ ] Create example for custom validation
- [ ] Create example for conditional fields
- [ ] Add Storybook stories for all components
- [ ] Create CodeSandbox examples

**Files:** New example files and Storybook setup

---

## 📋 Completed Tasks

- ✅ Created modular field component structure
- ✅ Implemented dynamic form engine
- ✅ Added TypeScript type definitions
- ✅ Created API provider pattern
- ✅ Added comprehensive documentation (ADDING_COMPONENTS.md)
- ✅ Created architecture review document
- ✅ Fixed useStore infinite loop risk (High Priority #1)
- ✅ Removed default API provider from library (Medium Priority #5)
- ✅ Made API provider required (consumer responsibility)

---

## 📝 Notes

- Tasks are organized by priority (High → Medium → Low)
- Each task includes specific file locations where applicable
- Some tasks may depend on others (e.g., tests depend on fixing bugs first)
- Review `ARCHITECTURE_REVIEW.md` for detailed context on each issue

---

## 🎯 Quick Start

To begin working on tasks:

1. **Start with High Priority items** - These address critical bugs and issues
2. **Move to Medium Priority** - These improve functionality and performance
3. **Complete Low Priority** - These enhance developer experience and polish

**Recommended order:**
1. ✅ Fix useStore infinite loop (High Priority #1) - COMPLETED
2. Improve type safety (High Priority #2)
3. Add error handling (High Priority #3)
4. ✅ Extract mock API (Medium Priority #5) - COMPLETED
5. Performance optimizations (Medium Priority #6)
