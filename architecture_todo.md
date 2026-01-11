# Architecture Improvements TODO

> **Reference:** See [ARCHITECTURE_REVIEW_V2.md](./ARCHITECTURE_REVIEW_V2.md) for detailed analysis, code examples, and implementation guidance.

This document tracks all architectural improvements identified in the first principles review, organized by priority and impact.

---

## 🔴 Phase 1: Critical Abstractions (High Impact, Medium Effort)

### 1. Field Registry Pattern
**Status:** ✅ Completed  
**Priority:** 🔴 Critical  
**Impact:** ⭐⭐⭐⭐⭐ (Enables plugin system, extensibility)

**Tasks:**
- [x] Create `FieldRegistry` class/interface
- [x] Implement field registration mechanism
- [x] Refactor `FormField.tsx` to use registry instead of switch statement
- [x] Add runtime field registration API
- [x] Update documentation for plugin developers (via code comments and exports)
- [x] Add tests for field registry

**Files to Create/Modify:**
- `form-design-lib/src/core/FieldRegistry.ts` (new)
- `form-design-lib/src/components/FormField.tsx` (refactor)
- `form-design-lib/src/index.ts` (export registry)

**Reference:** ARCHITECTURE_REVIEW_V2.md - Section 2.1

---

### 2. Validation Engine Extraction
**Status:** ⏳ Pending  
**Priority:** 🔴 Critical  
**Impact:** ⭐⭐⭐⭐⭐ (Separation of concerns, reusability)

**Tasks:**
- [ ] Create `ValidationEngine` class
- [ ] Create `ValidationRule` interface
- [ ] Extract validation logic from `DynamicForm.tsx`
- [ ] Implement built-in validation rules (required, minLength, maxLength, pattern, etc.)
- [ ] Create validation rule registry
- [ ] Support async validation rules
- [ ] Add custom validation rule registration API
- [ ] Update `DynamicForm.tsx` to use ValidationEngine
- [ ] Add tests for validation engine

**Files to Create/Modify:**
- `form-design-lib/src/core/ValidationEngine.ts` (new)
- `form-design-lib/src/core/validation/rules/` (new directory)
  - `requiredRule.ts`
  - `minLengthRule.ts`
  - `maxLengthRule.ts`
  - `patternRule.ts`
  - `minMaxRule.ts`
  - `dateRangeRule.ts`
  - `customRule.ts`
- `form-design-lib/src/core/validation/index.ts` (new)
- `form-design-lib/src/components/DynamicForm.tsx` (refactor - remove validation logic)

**Reference:** ARCHITECTURE_REVIEW_V2.md - Section 2.2

---

### 3. Binding System Abstraction
**Status:** ✅ Completed  
**Priority:** 🔴 Critical  
**Impact:** ⭐⭐⭐⭐ (Reduces complexity, centralizes logic)

**Tasks:**
- [x] Create `BindingResolver` class
- [x] Create `BindingStrategy` interface
- [x] Implement `DotNotationBindingStrategy`
- [x] Implement `ArrayBindingStrategy`
- [x] Implement `NestedListBindingStrategy`
- [x] Refactor `handleFieldChange` in `DynamicForm.tsx` to use BindingResolver
- [x] Refactor `useStore.ts` List field syncing to use BindingResolver
- [x] Refactor `ListField.tsx` binding construction to use BindingResolver
- [ ] Add tests for binding resolver

**Files to Create/Modify:**
- `form-design-lib/src/core/BindingResolver.ts` (new)
- `form-design-lib/src/core/binding/strategies/` (new directory)
  - `DotNotationBindingStrategy.ts`
  - `ArrayBindingStrategy.ts`
  - `NestedListBindingStrategy.ts`
- `form-design-lib/src/components/DynamicForm.tsx` (refactor)
- `form-design-lib/src/hooks/useStore.ts` (refactor)
- `form-design-lib/src/components/fields/ListField.tsx` (refactor)

**Reference:** ARCHITECTURE_REVIEW_V2.md - Section 2.4

---

## 🟡 Phase 2: State Management Refactoring (High Impact, High Effort)

### 4. Separate State Management from Data Fetching
**Status:** ⏳ Pending  
**Priority:** 🟡 High  
**Impact:** ⭐⭐⭐⭐ (Better testability, single responsibility)

**Tasks:**
- [ ] Create `StateManager` interface and implementation
- [ ] Create `DataFetcher` interface and implementation
- [ ] Create `CacheManager` interface and implementation
- [ ] Refactor `useStore.ts` to compose these services
- [ ] Extract data fetching logic to `DataFetcher`
- [ ] Extract state management to `StateManager`
- [ ] Extract cache logic to `CacheManager`
- [ ] Update `DynamicForm.tsx` to use new structure
- [ ] Add tests for each service

**Files to Create/Modify:**
- `form-design-lib/src/core/StateManager.ts` (new)
- `form-design-lib/src/core/DataFetcher.ts` (new)
- `form-design-lib/src/core/CacheManager.ts` (new)
- `form-design-lib/src/hooks/useStore.ts` (refactor - compose services)
- `form-design-lib/src/components/DynamicForm.tsx` (update if needed)

**Reference:** ARCHITECTURE_REVIEW_V2.md - Section 2.5

---

### 5. Cache Manager Abstraction
**Status:** ⏳ Pending  
**Priority:** 🟡 High  
**Impact:** ⭐⭐⭐ (Performance, testability)

**Tasks:**
- [ ] Create `CacheManager` interface
- [ ] Implement cache key generation
- [ ] Implement cache invalidation strategies
- [ ] Add cache TTL support
- [ ] Integrate with `DataFetcher`
- [ ] Add tests for cache manager

**Files to Create/Modify:**
- `form-design-lib/src/core/CacheManager.ts` (new)
- `form-design-lib/src/core/DataFetcher.ts` (integrate cache)

**Reference:** ARCHITECTURE_REVIEW_V2.md - Section 2.5

---

## 🟢 Phase 3: Extensibility (Medium Impact, Medium Effort)

### 6. Data Source Factory
**Status:** ⏳ Pending  
**Priority:** 🟢 Medium  
**Impact:** ⭐⭐⭐ (Multiple data source types)

**Tasks:**
- [ ] Create `DataSource` interface
- [ ] Create `DataSourceFactory` class
- [ ] Implement `ApiDataSource`
- [ ] Implement `LocalStorageDataSource` (optional)
- [ ] Refactor `useStore.ts` to use DataSourceFactory
- [ ] Update `types.ts` to support multiple source types
- [ ] Add tests for data sources

**Files to Create/Modify:**
- `form-design-lib/src/core/DataSource.ts` (new)
- `form-design-lib/src/core/DataSourceFactory.ts` (new)
- `form-design-lib/src/core/sources/` (new directory)
  - `ApiDataSource.ts`
  - `LocalStorageDataSource.ts` (optional)
- `form-design-lib/src/types.ts` (update SourceType)
- `form-design-lib/src/hooks/useStore.ts` (refactor)

**Reference:** ARCHITECTURE_REVIEW_V2.md - Section 2.3

---

### 7. Event System
**Status:** ⏳ Pending  
**Priority:** 🟢 Medium  
**Impact:** ⭐⭐⭐ (Cross-cutting concerns, analytics)

**Tasks:**
- [ ] Create `EventBus` interface and implementation
- [ ] Define `FormEvent` types
- [ ] Integrate event bus into `DynamicForm`
- [ ] Emit events for field changes, validation, submission
- [ ] Add event listener API
- [ ] Add tests for event system

**Files to Create/Modify:**
- `form-design-lib/src/core/EventBus.ts` (new)
- `form-design-lib/src/core/events/` (new directory)
  - `FormEvent.ts`
  - `FieldEvent.ts`
  - `ValidationEvent.ts`
- `form-design-lib/src/components/DynamicForm.tsx` (integrate events)

**Reference:** ARCHITECTURE_REVIEW_V2.md - Section 2.8

---

### 8. Configuration Validator
**Status:** ⏳ Pending  
**Priority:** 🟢 Medium  
**Impact:** ⭐⭐ (Runtime safety, better error messages)

**Tasks:**
- [ ] Create `ConfigValidator` interface
- [ ] Implement schema validation (using Zod or similar)
- [ ] Add validation for FormConfig structure
- [ ] Add validation for FormField structure
- [ ] Add validation for FormSource structure
- [ ] Integrate into `DynamicForm` initialization
- [ ] Add helpful error messages
- [ ] Add tests for config validation

**Files to Create/Modify:**
- `form-design-lib/src/core/ConfigValidator.ts` (new)
- `form-design-lib/src/core/validation/schemas/` (new directory)
  - `FormConfigSchema.ts`
  - `FormFieldSchema.ts`
  - `FormSourceSchema.ts`
- `form-design-lib/src/components/DynamicForm.tsx` (add validation on mount)

**Reference:** ARCHITECTURE_REVIEW_V2.md - Section 2.7

---

## 🔵 Phase 4: Standardization (Low Impact, Low Effort)

### 9. Standardize Field Component Interface
**Status:** ⏳ Pending  
**Priority:** 🔵 Low  
**Impact:** ⭐⭐ (Consistency, easier maintenance)

**Tasks:**
- [ ] Create `BaseFieldProps` interface
- [ ] Create `FieldContext` interface
- [ ] Update all field components to extend `BaseFieldProps`
- [ ] Standardize prop names across fields
- [ ] Add FieldContext provider (optional)
- [ ] Update documentation

**Files to Create/Modify:**
- `form-design-lib/src/core/FieldContext.ts` (new)
- `form-design-lib/src/components/fields/*.tsx` (update all field components)

**Reference:** ARCHITECTURE_REVIEW_V2.md - Section 2.6

---

### 10. Remove Hardcoded "object" Source Name
**Status:** ⏳ Pending  
**Priority:** 🔵 Low  
**Impact:** ⭐⭐ (Flexibility)

**Tasks:**
- [ ] Create `SourceNameResolver` utility
- [ ] Replace all hardcoded `'object'` references
- [ ] Make source name configurable
- [ ] Add `mainObjectSource` to `FormConfig` (optional)
- [ ] Update tests
- [ ] Update documentation

**Files to Create/Modify:**
- `form-design-lib/src/core/SourceNameResolver.ts` (new)
- `form-design-lib/src/hooks/useStore.ts` (refactor)
- `form-design-lib/src/components/DynamicForm.tsx` (refactor)
- `form-design-lib/src/types.ts` (add optional config)

**Reference:** ARCHITECTURE_REVIEW_V2.md - Section 2.9

---

## 🟣 Phase 5: Advanced Features (Future)

### 11. Plugin/Extension System
**Status:** ⏳ Future  
**Priority:** 🟣 Low  
**Impact:** ⭐⭐⭐⭐⭐ (Long-term extensibility)

**Tasks:**
- [ ] Design plugin architecture
- [ ] Create plugin registry
- [ ] Define plugin API
- [ ] Add plugin lifecycle hooks
- [ ] Create plugin examples
- [ ] Add plugin documentation

**Reference:** ARCHITECTURE_REVIEW_V2.md - Section 2.10

---

### 12. Performance Optimizations
**Status:** ⏳ Future  
**Priority:** 🟣 Low  
**Impact:** ⭐⭐⭐ (User experience)

**Tasks:**
- [ ] Implement memoization strategy
- [ ] Add virtual scrolling for large lists
- [ ] Implement field-level lazy loading
- [ ] Add performance monitoring
- [ ] Optimize re-render cycles

**Reference:** ARCHITECTURE_REVIEW_V2.md - Section 2.11

---

### 13. Form Builder/Designer
**Status:** ⏳ Future  
**Priority:** 🟣 Low  
**Impact:** ⭐⭐⭐⭐ (Developer experience)

**Tasks:**
- [ ] Design visual form builder UI
- [ ] Implement drag-and-drop interface
- [ ] Add form preview
- [ ] Add form export/import
- [ ] Create builder component

**Reference:** ARCHITECTURE_REVIEW_V2.md - Section 2.12

---

## Implementation Notes

### Migration Strategy
1. **Incremental Refactoring**: Add new abstractions alongside existing code
2. **Backward Compatibility**: Maintain existing API surface during migration
3. **Feature Flags**: Use feature flags to enable new abstractions gradually
4. **Testing**: Add comprehensive tests for each new abstraction
5. **Documentation**: Update docs as each abstraction is implemented

### Testing Requirements
- Unit tests for each new abstraction
- Integration tests for refactored components
- Migration tests to ensure backward compatibility
- Performance tests for optimizations

### Documentation Updates
- Update README.md with new APIs
- Create migration guide for breaking changes
- Add examples for new abstractions
- Update architecture diagrams

---

## Progress Tracking

**Total Tasks:** 13 major improvements  
**Completed:** 2 (Binding System Abstraction, Field Registry Pattern)  
**In Progress:** 0  
**Pending:** 11

**Estimated Timeline:**
- Phase 1: 2-3 weeks
- Phase 2: 2-3 weeks
- Phase 3: 1-2 weeks
- Phase 4: 1 week
- Phase 5: Future work

---

## Quick Reference

- **Architecture Review:** [ARCHITECTURE_REVIEW_V2.md](./ARCHITECTURE_REVIEW_V2.md)
- **Current TODO:** [TODO.md](./TODO.md) (feature-specific tasks)
- **Main README:** [form-design-lib/README.md](./form-design-lib/README.md)
