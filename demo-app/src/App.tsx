import React from 'react'
import { DynamicForm, FormConfig } from 'form-design-lib'
import '../../form-design-lib/src/style.css'
import { mockApiProvider } from './mockApi'
import './App.css'

const App: React.FC = () => {
  const exampleConfig: FormConfig = {
    formName: 'User Registration',
    gridSize: 12,
    // Enable collapsible sections
    collapsibleSections: true,
    defaultSectionState: 'expanded',
    // Enable debug logging to see fetch order and timing
    debug: true,
    sources: [
      {
        sourceName: 'countryList',
        sourceType: 'API',
        endpoint: '/api/countries',
      },
      {
        sourceName: 'stateList',
        sourceType: 'API',
        parameters: { countryCode: 'object.country' },
        endpoint: '/api/states?country={countryCode}',
      },
      {
        sourceName: 'interestsList',
        sourceType: 'API',
        endpoint: '/api/interests',
      },
      {
        sourceName: 'skillsList',
        sourceType: 'API',
        endpoint: '/api/skills',
      },
      {
        sourceName: 'experienceLevelsList',
        sourceType: 'API',
        endpoint: '/api/experience-levels',
      },
      {
        sourceName: 'employmentTypesList',
        sourceType: 'API',
        endpoint: '/api/employment-types',
      },
      {
        sourceName: 'object',
        sourceType: 'API',
        parameters: { id: 'queryString.userId' },
        endpoint: '/api/Users/{id}',
      },
      {
        sourceName: 'experienceList',
        sourceType: 'API',
        parameters: { id: 'object.userId' },
        endpoint: '/api/userExperience/{id}',
      },
    ],
    fields: [
      {
        section: 'User Information',
        fieldName: 'Username',
        fieldType: 'Text',
        required: true,
        maxLength: 20,
        minLength: 4,
        binding: 'object.username',
        gridSize: 6,
        validateOn: ['onBlur'],
        errorMessages: {
          required: 'Username is required',
          minLength: 'Username must be at least 4 characters',
          maxLength: 'Username cannot exceed 20 characters',
        },
      },
      {
        section: 'User Information',
        fieldName: 'Password',
        fieldType: 'Password',
        required: true,
        minLength: 8,
        binding: 'object.password',
        gridSize: 6,
        validateOn: ['onBlur'],
        errorMessages: {
          required: 'Password is required',
          minLength: 'Password must be at least 8 characters long',
        },
      },
      {
        section: 'User Information',
        fieldName: 'Email',
        fieldType: 'Email',
        required: true,
        binding: 'object.email',
        validationPattern: '^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$',
        gridSize: 6,
        validateOn: ['onBlur'],
        errorMessages: {
          required: 'Email address is required',
          pattern: 'Please enter a valid email address',
        },
      },
      {
        section: 'User Information',
        fieldName: 'Date of Birth',
        fieldType: 'Date',
        required: false,
        binding: 'object.dateOfBirth',
        gridSize: 6,
        validateOn: ['onBlur'],
        minDate: '1900-01-01',
        maxDate: 'today',
        errorMessages: {
          minDate: 'Date of birth cannot be before 1900',
          maxDate: 'Date of birth cannot be in the future',
        },
      },
      {
        section: 'Location Details',
        fieldName: 'Country',
        fieldType: 'Dropdown',
        required: true,
        binding: 'object.country',
        displayProperty: 'name',
        valueProperty: 'code',
        optionsSource: 'countryList',
        gridSize: 6,
        validateOn: ['onBlur'],
      },
      {
        section: 'Location Details',
        fieldName: 'State / Province',
        fieldType: 'Dropdown',
        required: true,
        binding: 'object.state',
        displayProperty: 'name',
        valueProperty: 'code',
        optionsSource: 'stateList',
        gridSize: 6,
        validateOn: ['onBlur'],
        // Field dependency: Only show State field when Country is selected
        dependsOn: {
          field: 'object.country',
          condition: (value: any) => !!value, // Show when country has a value
        },
      },
      {
        section: 'Preferences',
        fieldName: 'Subscribe to Newsletter',
        fieldType: 'Checkbox',
        required: false,
        binding: 'object.subscribeNewsletter',
        gridSize: 12,
        validateOn: ['onBlur'],
      },
      // New Field Types Examples
      {
        section: 'Additional Information',
        fieldName: 'Age',
        fieldType: 'Number',
        required: false,
        binding: 'object.age',
        gridSize: 4,
        min: 0,
        max: 120,
        validateOn: ['onBlur'],
        errorMessages: {
          min: 'Age must be at least 0',
          max: 'Age cannot exceed 120',
        },
      },
      {
        section: 'Additional Information',
        fieldName: 'Years of Experience',
        fieldType: 'Number',
        required: false,
        binding: 'object.yearsOfExperience',
        gridSize: 4,
        min: 0,
        max: 50,
        validateOn: ['onBlur'],
        errorMessages: {
          min: 'Experience cannot be negative',
          max: 'Experience cannot exceed 50 years',
        },
      },
      {
        section: 'Additional Information',
        fieldName: 'Salary Expectation',
        fieldType: 'Number',
        required: false,
        binding: 'object.salary',
        gridSize: 4,
        min: 0,
        validateOn: ['onBlur'],
        errorMessages: {
          min: 'Salary must be a positive number',
        },
      },
      {
        section: 'Additional Information',
        fieldName: 'Bio',
        fieldType: 'Textarea',
        required: false,
        binding: 'object.bio',
        gridSize: 12,
        minLength: 10,
        maxLength: 500,
        validateOn: ['onBlur'],
        errorMessages: {
          minLength: 'Bio must be at least 10 characters',
          maxLength: 'Bio cannot exceed 500 characters',
        },
      },
      {
        section: 'Additional Information',
        fieldName: 'Additional Notes',
        fieldType: 'Textarea',
        required: false,
        binding: 'object.notes',
        gridSize: 12,
        maxLength: 1000,
        validateOn: ['onBlur'],
        errorMessages: {
          maxLength: 'Notes cannot exceed 1000 characters',
        },
      },
      {
        section: 'Selection Fields',
        fieldName: 'Experience Level',
        fieldType: 'Radio',
        required: true,
        binding: 'object.experienceLevel',
        displayProperty: 'label',
        valueProperty: 'value',
        optionsSource: 'experienceLevelsList',
        radioLayout: 'inline',
        gridSize: 12,
        validateOn: ['onBlur'],
        errorMessages: {
          required: 'Please select your experience level',
        },
      },
      {
        section: 'Selection Fields',
        fieldName: 'Primary Interest',
        fieldType: 'Radio',
        required: false,
        binding: 'object.primaryInterest',
        displayProperty: 'label',
        valueProperty: 'value',
        optionsSource: 'interestsList',
        radioLayout: 'vertical',
        gridSize: 6,
        validateOn: ['onBlur'],
        // Conditional visibility: Only show if experience level is advanced or expert
        visible: (store: Record<string, any>) => {
          const level = store.object?.experienceLevel
          return level === 'advanced' || level === 'expert'
        },
      },
      {
        section: 'Selection Fields',
        fieldName: 'Skills',
        fieldType: 'MultiSelect',
        required: true,
        binding: 'object.skills',
        displayProperty: 'label',
        valueProperty: 'value',
        optionsSource: 'skillsList',
        maxSelections: 5,
        gridSize: 6,
        validateOn: ['onBlur'],
        errorMessages: {
          required: 'Please select at least one skill',
          custom: 'You can select up to 5 skills',
        },
      },
      {
        section: 'Selection Fields',
        fieldName: 'Interests',
        fieldType: 'MultiSelect',
        required: false,
        binding: 'object.interests',
        displayProperty: 'label',
        valueProperty: 'value',
        optionsSource: 'interestsList',
        gridSize: 12,
        validateOn: ['onBlur'],
      },
      {
        section: 'File Uploads',
        fieldName: 'Profile Picture',
        fieldType: 'File',
        required: false,
        binding: 'object.profilePicture',
        accept: 'image/*',
        multiple: false,
        maxFileSize: 5 * 1024 * 1024, // 5MB
        gridSize: 6,
        validateOn: ['onBlur'],
        errorMessages: {
          custom: 'File size must be less than 5 MB',
        },
      },
      {
        section: 'File Uploads',
        fieldName: 'Resume',
        fieldType: 'File',
        required: false,
        binding: 'object.resume',
        accept: '.pdf,.doc,.docx',
        multiple: false,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        gridSize: 6,
        validateOn: ['onBlur'],
        errorMessages: {
          custom: 'File size must be less than 10 MB. Accepted formats: PDF, DOC, DOCX',
        },
        // Field dependency: Show resume upload only for employed users
        dependsOn: {
          field: 'object.experienceLevel',
          values: ['intermediate', 'advanced', 'expert'], // Show for these experience levels
        },
      },
      {
        section: 'File Uploads',
        fieldName: 'Portfolio Files',
        fieldType: 'File',
        required: false,
        binding: 'object.portfolioFiles',
        accept: 'image/*,.pdf',
        multiple: true,
        maxFileSize: 5 * 1024 * 1024, // 5MB per file
        gridSize: 12,
        validateOn: ['onBlur'],
        errorMessages: {
          custom: 'Each file must be less than 5 MB',
        },
        // Field dependency: Show portfolio only for advanced/expert levels
        dependsOn: {
          field: 'object.experienceLevel',
          values: ['advanced', 'expert'],
        },
      },
      // Conditional Fields Section - Demonstrates field dependencies
      {
        section: 'Conditional Fields',
        fieldName: 'Employment Type',
        fieldType: 'Dropdown',
        required: false,
        binding: 'object.employmentType',
        gridSize: 6,
        validateOn: ['onBlur'],
        // Mock options - in real app, this would come from an API source
        displayProperty: 'label',
        valueProperty: 'value',
        optionsSource: 'employmentTypesList',
      },
      {
        section: 'Conditional Fields',
        fieldName: 'Company Name',
        fieldType: 'Text',
        required: false,
        binding: 'object.companyName',
        gridSize: 6,
        validateOn: ['onBlur'],
        // Show only when employment type is 'employed'
        dependsOn: {
          field: 'object.employmentType',
          value: 'employed',
        },
      },
      {
        section: 'Conditional Fields',
        fieldName: 'Freelance Rate',
        fieldType: 'Number',
        required: false,
        binding: 'object.freelanceRate',
        gridSize: 6,
        min: 0,
        validateOn: ['onBlur'],
        // Show only when employment type is 'freelance'
        dependsOn: {
          field: 'object.employmentType',
          value: 'freelance',
        },
        errorMessages: {
          min: 'Rate must be a positive number',
        },
      },
      {
        section: 'Conditional Fields',
        fieldName: 'Student ID',
        fieldType: 'Text',
        required: false,
        binding: 'object.studentId',
        gridSize: 6,
        validateOn: ['onBlur'],
        // Show only when employment type is 'student'
        dependsOn: {
          field: 'object.employmentType',
          value: 'student',
        },
      },
      {
        section: 'Conditional Fields',
        fieldName: 'Years at Company',
        fieldType: 'Number',
        required: false,
        binding: 'object.yearsAtCompany',
        gridSize: 6,
        min: 0,
        max: 50,
        validateOn: ['onBlur'],
        // Show only when company name is filled (custom condition)
        dependsOn: {
          field: 'object.companyName',
          condition: (value: any) => !!value && value.length > 0,
        },
        errorMessages: {
          min: 'Years cannot be negative',
          max: 'Years cannot exceed 50',
        },
      },
      {
        section: 'Conditional Fields',
        fieldName: 'Show Advanced Options',
        fieldType: 'Checkbox',
        required: false,
        binding: 'object.showAdvanced',
        gridSize: 12,
        validateOn: ['onBlur'],
      },
      {
        section: 'Conditional Fields',
        fieldName: 'Advanced Setting 1',
        fieldType: 'Text',
        required: false,
        binding: 'object.advancedSetting1',
        gridSize: 6,
        validateOn: ['onBlur'],
        // Show only when checkbox is checked
        dependsOn: {
          field: 'object.showAdvanced',
          value: true,
        },
      },
      {
        section: 'Conditional Fields',
        fieldName: 'Advanced Setting 2',
        fieldType: 'Number',
        required: false,
        binding: 'object.advancedSetting2',
        gridSize: 6,
        min: 0,
        validateOn: ['onBlur'],
        // Show only when checkbox is checked
        dependsOn: {
          field: 'object.showAdvanced',
          value: true,
        },
      },
      {
        section: 'Date Ranges',
        fieldName: 'Available Period',
        fieldType: 'DateRange',
        required: false,
        binding: 'object.availablePeriod',
        minDate: 'today',
        gridSize: 6,
        validateOn: ['onBlur'],
        errorMessages: {
          required: 'Please select an available period',
          minDate: 'Start date cannot be in the past',
        },
      },
      {
        section: 'Date Ranges',
        fieldName: 'Project Timeline',
        fieldType: 'DateRange',
        required: false,
        binding: 'object.projectTimeline',
        minDate: '2024-01-01',
        maxDate: '2025-12-31',
        gridSize: 6,
        validateOn: ['onBlur'],
        errorMessages: {
          minDate: 'Start date must be after 2024-01-01',
          maxDate: 'End date must be before 2025-12-31',
        },
      },
      // List Field Example - Work Experience
      {
        section: 'Work Experience',
        fieldName: 'Experience',
        fieldType: 'List',
        required: false,
        binding: 'object.userExperience', // Full path to the property in the main object
        listSource: 'experienceList', // Source name where data comes from
        itemObject: 'experienceItem', // Prefix for nested field bindings
        gridSize: 12,
        validateOn: ['onBlur'],
        fields: [
          {
            section: 'Experience',
            fieldName: 'Employer',
            fieldType: 'Text',
            required: true,
            binding: 'experienceItem.employer', // Uses itemObject prefix
            gridSize: 6,
            validateOn: ['onBlur'],
            errorMessages: {
              required: 'Employer name is required',
            },
          },
          {
            section: 'Experience',
            fieldName: 'Position',
            fieldType: 'Text',
            required: true,
            binding: 'experienceItem.position', // Uses itemObject prefix
            gridSize: 6,
            validateOn: ['onBlur'],
            errorMessages: {
              required: 'Position is required',
            },
          },
          {
            section: 'Experience',
            fieldName: 'Start Date',
            fieldType: 'Date',
            required: true,
            binding: 'experienceItem.startDate', // Uses itemObject prefix
            gridSize: 3,
            validateOn: ['onBlur'],
            maxDate: 'today',
            errorMessages: {
              required: 'Start date is required',
              maxDate: 'Start date cannot be in the future',
            },
          },
          {
            section: 'Experience',
            fieldName: 'End Date',
            fieldType: 'Date',
            required: false,
            binding: 'experienceItem.endDate', // Uses itemObject prefix
            gridSize: 3,
            validateOn: ['onBlur'],
            maxDate: 'today',
            errorMessages: {
              maxDate: 'End date cannot be in the future',
            },
          },
          {
            section: 'Experience',
            fieldName: 'Location',
            fieldType: 'Text',
            required: false,
            binding: 'experienceItem.location', // Uses itemObject prefix
            gridSize: 6,
            validateOn: ['onBlur'],
          },
          {
            section: 'Experience',
            fieldName: 'Description',
            fieldType: 'Textarea',
            required: false,
            binding: 'experienceItem.description', // Uses itemObject prefix
            gridSize: 12,
            maxLength: 500,
            validateOn: ['onBlur'],
            errorMessages: {
              maxLength: 'Description cannot exceed 500 characters',
            },
          },
        ],
      },
    ],
  }

  const handleSubmit = async (data: Record<string, any>) => {
    console.log('Demo App: Form submitted with data:', data)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  const handleReset = () => {
    console.log('Demo App: Form reset')
  }

  const handleError = (error: any) => {
    console.error('Demo App: API Error caught:', error)
  }

  const handleValidationError = (errors: Record<string, string>) => {
    console.warn('Demo App: Form validation errors:', errors)
  }

  return (
    <div className="app">
      <div className="app-container">
        <div className="app-header">
          <h1 className="app-title">React Dynamic Form Engine</h1>
          <p className="app-subtitle">
            Renders forms from JSON, handles dependent API sources, and binds data automatically.
            <br />
            <strong>New Features:</strong> Collapsible sections, field dependencies, conditional visibility, form reset, and localStorage persistence.
          </p>
        </div>
        <DynamicForm
          config={exampleConfig}
          apiProvider={mockApiProvider}
          persistState={false}
          storageKey="demo-form-state"
          onSubmit={handleSubmit}
          onReset={handleReset}
          onError={handleError}
          onValidationError={handleValidationError}
        />
      </div>
    </div>
  )
}

export default App
