# Visual Form Builder TODO

A comprehensive task list for implementing the visual form builder for `form-design-lib`.

## Project Setup

- [ ] Create new package `form-design-lib-builder` in monorepo
- [ ] Set up package.json with dependencies
- [ ] Configure Vite build for the builder package
- [ ] Set up TypeScript configuration
- [ ] Add form-design-lib as a peer dependency
- [ ] Create basic project structure (components, hooks, utils)
- [ ] Set up CSS/styling system
- [ ] Add build scripts and development server

## Core Architecture

- [ ] Design FormBuilder component API
- [ ] Create FormBuilderProps interface
- [ ] Implement main FormBuilder container component
- [ ] Set up state management (useState/useReducer or Zustand)
- [ ] Create FormBuilderContext for state sharing
- [ ] Implement config validation utilities
- [ ] Create field ID generation system (for tracking fields)

## Field Palette (Left Sidebar)

- [ ] Create FieldPalette component
- [ ] Implement field type cards with icons
- [ ] Group field types by category (Basic, Advanced, Custom)
- [ ] Add drag functionality to field cards
- [ ] Implement search/filter for field types
- [ ] Add visual feedback on drag start
- [ ] Integrate with FieldRegistry to show available fields
- [ ] Add tooltips for each field type
- [ ] Style field palette with proper layout

## Canvas/Workspace (Center)

- [ ] Create Canvas component
- [ ] Implement drop zones for fields
- [ ] Render form structure visually
- [ ] Add section containers (collapsible)
- [ ] Implement field rendering in canvas
- [ ] Add visual grid overlay
- [ ] Implement field selection (click to select)
- [ ] Add hover states for fields
- [ ] Implement drag to reorder fields
- [ ] Add visual indicators (selected, hovered, drop zones)
- [ ] Implement inline editing for field names
- [ ] Add empty state when no fields exist
- [ ] Add section headers with collapse/expand
- [ ] Implement field deletion (Delete key or button)
- [ ] Add visual feedback for drag operations

## Property Panel (Right Sidebar)

- [ ] Create PropertyPanel component
- [ ] Implement dynamic form based on selected field type
- [ ] Add common properties editor:
  - [ ] Field name input
  - [ ] Binding path input with validation
  - [ ] Required checkbox
  - [ ] Grid size selector (1-12) with visual grid
  - [ ] Section dropdown/input
- [ ] Add type-specific property editors:
  - [ ] Text: minLength, maxLength, pattern
  - [ ] Number: min, max
  - [ ] Date: minDate, maxDate
  - [ ] Dropdown/Radio/MultiSelect: optionsSource, displayProperty, valueProperty
  - [ ] List: listSource, itemObject, nested fields editor
  - [ ] File: accept, multiple, maxFileSize
  - [ ] Radio: radioLayout
  - [ ] MultiSelect: maxSelections
- [ ] Add advanced properties:
  - [ ] Validation triggers (onChange, onBlur, onSubmit checkboxes)
  - [ ] Custom validator code editor (simple textarea for now)
  - [ ] Conditional visibility builder
  - [ ] Field dependencies editor
  - [ ] Error messages editor
- [ ] Add empty state when no field selected
- [ ] Implement property validation
- [ ] Add help text/tooltips for each property

## Toolbar (Top)

- [ ] Create Toolbar component
- [ ] Add Save button (localStorage)
- [ ] Add Load button (localStorage/file)
- [ ] Add Export button (JSON, TypeScript, Copy to clipboard)
- [ ] Add Import button (JSON file upload)
- [ ] Add Preview toggle button
- [ ] Add Undo button
- [ ] Add Redo button
- [ ] Add Clear form button
- [ ] Add Settings button (grid size, default section state)
- [ ] Add Form name editor
- [ ] Style toolbar with proper layout

## State Management

- [ ] Create useFormBuilder hook
- [ ] Implement config state management
- [ ] Implement selected field state
- [ ] Implement field order tracking
- [ ] Implement undo/redo system
- [ ] Implement localStorage persistence for drafts
- [ ] Add state validation
- [ ] Implement config change callbacks

## Drag and Drop

- [ ] Install and configure @dnd-kit/core
- [ ] Create useDragAndDrop hook
- [ ] Implement drag from palette
- [ ] Implement drop on canvas
- [ ] Implement drag to reorder fields
- [ ] Add visual feedback during drag
- [ ] Handle drop zones (sections, between fields)
- [ ] Prevent invalid drops
- [ ] Add drag preview customization

## Field Selection

- [ ] Create useFieldSelection hook
- [ ] Implement field selection on click
- [ ] Implement selection clearing
- [ ] Add keyboard navigation (Arrow keys)
- [ ] Implement multi-select (optional, for future)
- [ ] Add selection persistence

## Preview Mode

- [ ] Create PreviewPanel component
- [ ] Implement preview toggle
- [ ] Render DynamicForm in preview mode
- [ ] Add mock API provider for preview
- [ ] Add preview controls (submit, reset)
- [ ] Handle preview state management
- [ ] Add smooth transition between modes

## Section Management

- [ ] Create SectionManager component (or integrate in canvas)
- [ ] Implement add section functionality
- [ ] Implement remove section functionality
- [ ] Implement rename section
- [ ] Implement reorder sections
- [ ] Add section settings (default collapse state)
- [ ] Handle fields when section is deleted

## Data Sources Editor

- [ ] Create DataSourcesPanel component
- [ ] Add data sources list view
- [ ] Implement add data source
- [ ] Implement remove data source
- [ ] Add source configuration form:
  - [ ] Source name input
  - [ ] Endpoint URL input
  - [ ] Parameters editor
- [ ] Add parameter mapping UI
- [ ] Validate source configuration
- [ ] Show source dependencies

## Binding Path Builder

- [ ] Create BindingPathBuilder component
- [ ] Add visual path builder
- [ ] Implement autocomplete for existing bindings
- [ ] Add path validation
- [ ] Support array indices [0]
- [ ] Add path suggestions
- [ ] Show path structure visually

## Conditional Logic Builder

- [ ] Create ConditionalLogicBuilder component
- [ ] Add field dependencies UI
- [ ] Implement visibility rules editor
- [ ] Add condition builder (value matching, custom function)
- [ ] Visual condition representation
- [ ] Validate conditions

## Validation Rules Editor

- [ ] Create ValidationRulesEditor component
- [ ] Add validation triggers selector
- [ ] Add custom validator code editor (simple textarea)
- [ ] Add error messages editor
- [ ] Add validation rule templates
- [ ] Validate validation rules

## Export/Import

- [ ] Implement JSON export
- [ ] Implement TypeScript export
- [ ] Implement copy to clipboard
- [ ] Implement JSON import (file upload)
- [ ] Implement JSON import (paste)
- [ ] Validate imported config
- [ ] Handle import errors gracefully
- [ ] Add export formatting options

## Settings

- [ ] Create SettingsPanel component
- [ ] Add grid size setting (1-12)
- [ ] Add default section state setting
- [ ] Add form name setting
- [ ] Add debug mode toggle
- [ ] Add persistence settings
- [ ] Save settings to localStorage

## Styling & UI/UX

- [ ] Design split-pane layout
- [ ] Style field palette
- [ ] Style canvas/workspace
- [ ] Style property panel
- [ ] Style toolbar
- [ ] Add color coding for field types
- [ ] Add visual grid overlay
- [ ] Add smooth animations
- [ ] Implement responsive design
- [ ] Add dark mode support (optional)
- [ ] Add loading states
- [ ] Add error states
- [ ] Add empty states

## Keyboard Shortcuts

- [ ] Implement Delete key (delete selected field)
- [ ] Implement Ctrl+Z (undo)
- [ ] Implement Ctrl+Y (redo)
- [ ] Implement Ctrl+S (save)
- [ ] Implement Escape (clear selection)
- [ ] Implement Arrow keys (navigate fields)
- [ ] Add keyboard shortcuts help modal

## Context Menus

- [ ] Implement right-click context menu
- [ ] Add "Delete" option
- [ ] Add "Duplicate" option
- [ ] Add "Copy" option
- [ ] Add "Paste" option
- [ ] Add field-specific options

## Integration with form-design-lib

- [ ] Import DynamicForm for preview
- [ ] Import FieldRegistry for available fields
- [ ] Import FormConfig and FormField types
- [ ] Create mock API provider for preview
- [ ] Ensure type compatibility
- [ ] Test integration

## Testing

- [ ] Add unit tests for hooks
- [ ] Add unit tests for utilities
- [ ] Add component tests
- [ ] Add integration tests
- [ ] Test drag and drop
- [ ] Test export/import
- [ ] Test state management
- [ ] Test edge cases

## Documentation

- [ ] Write README for form-design-lib-builder
- [ ] Document FormBuilder API
- [ ] Add usage examples
- [ ] Document keyboard shortcuts
- [ ] Add architecture documentation
- [ ] Create getting started guide

## Polish & Optimization

- [ ] Optimize re-renders
- [ ] Add memoization where needed
- [ ] Optimize drag and drop performance
- [ ] Add error boundaries
- [ ] Improve accessibility
- [ ] Add ARIA labels
- [ ] Test with screen readers
- [ ] Add analytics (optional)

## Future Enhancements (Out of Scope for Now)

- [ ] Backend integration (save/load from server)
- [ ] Real-time collaboration
- [ ] Pre-built form templates
- [ ] Version history
- [ ] Form sharing
- [ ] Advanced code editor (Monaco)
- [ ] Multi-language support
- [ ] Form analytics
- [ ] Custom themes

---

## Implementation Priority

### Phase 1: MVP (Core Functionality)
1. Project Setup
2. Core Architecture
3. Field Palette (basic)
4. Canvas (basic rendering)
5. Property Panel (basic properties)
6. Toolbar (save, export, preview)
7. State Management (basic)
8. Drag and Drop (basic)

### Phase 2: Enhanced Features
1. Section Management
2. Field Reordering
3. Preview Mode (full)
4. Import/Export (full)
5. Undo/Redo
6. Data Sources Editor
7. Binding Path Builder

### Phase 3: Advanced Features
1. Conditional Logic Builder
2. Validation Rules Editor
3. Advanced Property Editors
4. Keyboard Shortcuts
5. Context Menus
6. Settings Panel

### Phase 4: Polish
1. Styling & UI/UX
2. Testing
3. Documentation
4. Optimization
5. Accessibility

---

## Notes

- All features should work without backend
- Component should be fully embeddable
- Focus on local state management (localStorage for persistence)
- Keep bundle size reasonable
- Ensure good performance with large forms
- Make it extensible for future features
