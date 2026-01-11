import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, AlertCircle, Save, CheckCircle2 } from 'lucide-react';

/**
 * UTILITIES
 * Helper functions to handle deep object access (dot notation)
 */
const getNestedValue = (obj, path) => {
  if (!path || !obj) return undefined;
  // Handle "queryString" special case for the demo
  if (path.startsWith('queryString.')) {
    const key = path.split('.')[1];
    return { userId: '123' }[key]; // Mock query string
  }
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const setNestedValue = (obj, path, value) => {
  const deepClone = JSON.parse(JSON.stringify(obj));
  const keys = path.split('.');
  let current = deepClone;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  
  current[keys[keys.length - 1]] = value;
  return deepClone;
};

/**
 * MOCK API
 * Simulates the backend endpoints defined in the JSON configuration.
 */
const mockApiCall = async (endpoint, method = 'GET') => {
  console.log(`[API] ${method} ${endpoint}`);
  
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 800));

  // 1. /api/countries
  if (endpoint === '/api/countries') {
    return [
      { code: 'US', name: 'United States' },
      { code: 'CA', name: 'Canada' },
      { code: 'DE', name: 'Germany' },
      { code: 'JP', name: 'Japan' },
    ];
  }

  // 2. /api/states?country=...
  if (endpoint.includes('/api/states')) {
    const url = new URL(`http://mock${endpoint}`);
    const country = url.searchParams.get('country');
    
    const states = {
      'US': [{ code: 'NY', name: 'New York' }, { code: 'CA', name: 'California' }, { code: 'TX', name: 'Texas' }],
      'CA': [{ code: 'ON', name: 'Ontario' }, { code: 'QC', name: 'Quebec' }],
      'DE': [{ code: 'BE', name: 'Berlin' }, { code: 'BY', name: 'Bavaria' }],
      'JP': [{ code: 'TK', name: 'Tokyo' }, { code: 'OS', name: 'Osaka' }]
    };
    return states[country] || [];
  }

  // 3. /api/Users/{id}
  if (endpoint.match(/\/api\/Users\/\w+/)) {
    // Return mock user data structure
    return {
      username: "jdoe_existing",
      email: "john.doe@example.com",
      subscribeNewsletter: true,
      country: "US", 
      state: "NY" // This will trigger the state dependency logic
    };
  }

  return null;
};

/**
 * CUSTOM HOOK: useStore
 * Manages the form state, initialization, and data dependencies.
 */
const useStore = (config) => {
  // Global data store. Keys correspond to 'sourceName' in config.
  const [store, setStore] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  
  // To prevent infinite loops, we track the last params used to fetch a source
  const prevParamsRef = useRef({});

  // Effect 1: Initialize store structure based on sources
  useEffect(() => {
    const initialStore = {};
    config.Sources.forEach(source => {
      initialStore[source.sourceName] = source.sourceName === 'object' ? {} : [];
    });
    setStore(prev => ({ ...initialStore, ...prev }));
  }, [config]);

  // Effect 2: Data Source Engine
  useEffect(() => {
    const checkAndFetchSources = async () => {
      for (const source of config.Sources) {
        if (source.sourceType !== 'API') continue;

        let url = source.endpoint;
        let shouldFetch = true;
        let resolvedParams = {};

        // Resolve Parameters
        if (source.parameters) {
          Object.entries(source.parameters).forEach(([paramName, paramPath]) => {
            const value = getNestedValue(store, paramPath);
            resolvedParams[paramName] = value;

            // If a required parameter is missing/undefined, we cannot fetch this source yet
            if (value === undefined || value === null || value === '') {
              shouldFetch = false;
            } else {
              url = url.replace(`{${paramName}}`, value);
              if(url.includes('{id}')) url = url.replace('{id}', value);
            }
          });
        }

        if (!shouldFetch) continue; 

        // Check cache signature
        const paramsSignature = JSON.stringify({ url, ...resolvedParams });
        if (prevParamsRef.current[source.sourceName] === paramsSignature) {
            continue;
        }

        // Perform Fetch
        setLoadingStates(prev => ({ ...prev, [source.sourceName]: true }));
        
        try {
          const data = await mockApiCall(url);
          
          setStore(prev => {
             if (source.sourceName === 'object') {
                 return { ...prev, [source.sourceName]: { ...prev[source.sourceName], ...data } };
             }
             return { ...prev, [source.sourceName]: data };
          });
          
          prevParamsRef.current[source.sourceName] = paramsSignature;

        } catch (err) {
          console.error(`Failed to load ${source.sourceName}`, err);
        } finally {
          setLoadingStates(prev => ({ ...prev, [source.sourceName]: false }));
        }
      }
    };

    checkAndFetchSources();
  }, [store, config.Sources]);

  return { store, setStore, loadingStates };
};

/**
 * COMPONENT: Form Field Renderer
 * Renders individual inputs based on configuration
 */
const FormField = ({ field, value, onChange, error, sourceData, isLoadingSource }) => {
  const commonClasses = `w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
    error ? 'border-red-500 bg-red-50' : 'border-gray-300'
  }`;

  const Label = () => (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {field.fieldName} {field.required && <span className="text-red-500">*</span>}
    </label>
  );

  const ErrorMsg = () => (
    error ? <p className="text-xs text-red-500 mt-1 flex items-center"><AlertCircle size={12} className="mr-1"/> {error}</p> : null
  );

  switch (field.fieldType) {
    case 'Text':
    case 'Email':
    case 'Password':
      return (
        <div className={`col-span-${field.gridSize || 12}`}>
          <Label />
          <input
            type={field.fieldType.toLowerCase()}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={commonClasses}
            maxLength={field.maxLength}
            placeholder={`Enter ${field.fieldName}`}
          />
          <ErrorMsg />
        </div>
      );

    case 'Date':
      return (
        <div className={`col-span-${field.gridSize || 12}`}>
          <Label />
          <input
            type="date"
            value={value ? new Date(value).toISOString().split('T')[0] : ''}
            onChange={(e) => onChange(e.target.value)}
            className={commonClasses}
          />
          <ErrorMsg />
        </div>
      );

    case 'Checkbox':
      return (
        <div className={`col-span-${field.gridSize || 12} flex items-center mt-6`}>
          <input
            type="checkbox"
            id={field.binding}
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor={field.binding} className="ml-2 block text-sm text-gray-900">
            {field.fieldName}
          </label>
          <ErrorMsg />
        </div>
      );

    case 'Dropdown':
      const options = sourceData[field.optionsSource] || [];
      return (
        <div className={`col-span-${field.gridSize || 12}`}>
          <Label />
          <div className="relative">
            <select
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              disabled={isLoadingSource}
              className={`${commonClasses} ${isLoadingSource ? 'bg-gray-100 text-gray-400' : 'bg-white'}`}
            >
              <option value="">Select...</option>
              {options.map((opt, idx) => (
                <option key={idx} value={opt[field.valueProperty]}>
                  {opt[field.displayProperty]}
                </option>
              ))}
            </select>
            {isLoadingSource && (
              <div className="absolute right-3 top-2.5">
                <Loader2 className="animate-spin text-gray-500" size={16} />
              </div>
            )}
          </div>
          <ErrorMsg />
        </div>
      );

    default:
      return null;
  }
};

/**
 * COMPONENT: DynamicForm
 * The main engine that processes the JSON
 */
const DynamicForm = ({ config }) => {
  // Use the custom hook for data management
  const { store, setStore, loadingStates } = useStore(config);
  
  const [formErrors, setFormErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleFieldChange = (bindingPath, newValue) => {
    const [rootSource] = bindingPath.split('.');
    
    setStore(prev => {
        const newRootData = setNestedValue(prev[rootSource] || {}, bindingPath.replace(`${rootSource}.`, ''), newValue);
        return { ...prev, [rootSource]: newRootData };
    });

    if (formErrors[bindingPath]) {
      setFormErrors(prev => ({ ...prev, [bindingPath]: undefined }));
    }
  };

  const validate = () => {
    const newErrors = {};
    let isValid = true;

    config.Fields.forEach(field => {
      const value = getNestedValue(store, field.binding);
      
      if (field.required && (value === undefined || value === null || value === '')) {
        newErrors[field.binding] = `${field.fieldName} is required`;
        isValid = false;
      }

      if (value && field.minLength && String(value).length < field.minLength) {
        newErrors[field.binding] = `Must be at least ${field.minLength} chars`;
        isValid = false;
      }

      if (value && field.validationPattern) {
        const regex = new RegExp(field.validationPattern);
        if (!regex.test(value)) {
          newErrors[field.binding] = `Invalid format`;
          isValid = false;
        }
      }
    });

    setFormErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log('Submitting Form Data:', store.object);
      setSubmitStatus('success');
      setTimeout(() => setSubmitStatus(null), 3000);
    } else {
      setSubmitStatus(null);
    }
  };

  const sections = config.Fields.reduce((acc, field) => {
    const sectionName = field.section || 'General';
    if (!acc[sectionName]) acc[sectionName] = [];
    acc[sectionName].push(field);
    return acc;
  }, {});

  const isFormLoading = loadingStates['object'];

  if (isFormLoading && Object.keys(store.object || {}).length === 0) {
    return (
        <div className="flex flex-col items-center justify-center p-12 h-64">
            <Loader2 className="animate-spin h-8 w-8 text-blue-500 mb-4" />
            <p className="text-gray-500">Loading User Data...</p>
        </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-100">
      <div className="bg-slate-800 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">{config.FormName}</h2>
        {submitStatus === 'success' && (
            <span className="flex items-center text-green-400 text-sm font-medium animate-pulse">
                <CheckCircle2 size={16} className="mr-1"/> Saved Successfully
            </span>
        )}
      </div>

      <div className="p-6 space-y-8">
        {Object.entries(sections).map(([sectionName, fields]) => (
          <div key={sectionName} className="border border-gray-200 rounded-lg p-5 bg-gray-50/50">
            <h3 className="text-lg font-medium text-gray-800 mb-4 border-b border-gray-200 pb-2">
              {sectionName}
            </h3>
            <div className={`grid grid-cols-${config.gridSize} gap-4`}>
              {fields.map((field, idx) => (
                <FormField
                  key={idx}
                  field={field}
                  value={getNestedValue(store, field.binding)}
                  onChange={(val) => handleFieldChange(field.binding, val)}
                  error={formErrors[field.binding]}
                  sourceData={store}
                  isLoadingSource={loadingStates[field.optionsSource]}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
        <button
          type="submit"
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
        >
          <Save size={18} className="mr-2" />
          Save Changes
        </button>
      </div>

      <div className="bg-gray-900 p-4 text-xs text-green-400 font-mono overflow-auto max-h-48 border-t-4 border-slate-700">
        <p className="mb-2 font-bold text-gray-400 uppercase tracking-wider">Live Store State (Debug):</p>
        <pre>{JSON.stringify(store, null, 2)}</pre>
      </div>
    </form>
  );
};

/**
 * COMPONENT: App
 * Hosts the example JSON and renders the builder.
 */
const App = () => {
  const exampleConfig = {
    "FormName": "User Registration",
    "gridSize": 12,
    "Sources": [
      {
        "sourceName": "countryList",
        "sourceType": "API",
        "endpoint": "/api/countries"
      },
      {
        "sourceName": "stateList",
        "sourceType": "API",
        "parameters": { "countryCode": "object.country" },
        "endpoint": "/api/states?country={countryCode}"
      },
      {
        "sourceName": "object",
        "sourceType": "API",
        "parameters": { "id": "queryString.userId" },
        "endpoint": "/api/Users/{id}"
      }
    ],
    "Fields": [
      {
        "section": "User Information",
        "fieldName": "Username",
        "fieldType": "Text",
        "required": true,
        "maxLength": 20,
        "minLength": 4,
        "binding": "object.username",
        "gridSize": 6
      },
      {
        "section": "User Information",
        "fieldName": "Password",
        "fieldType": "Password",
        "required": true,
        "minLength": 8,
        "binding": "object.password",
        "gridSize": 6
      },
      {
        "section": "User Information",
        "fieldName": "Email",
        "fieldType": "Email",
        "required": true,
        "binding": "object.email",
        "validationPattern": "^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$",
        "gridSize": 6
      },
      {
        "section": "User Information",
        "fieldName": "Date of Birth",
        "fieldType": "Date",
        "required": false,
        "binding": "object.dateOfBirth",
        "gridSize": 6
      },
      {
        "section": "Location Details",
        "fieldName": "Country",
        "fieldType": "Dropdown",
        "required": true,
        "binding": "object.country",
        "displayProperty": "name",
        "valueProperty": "code",
        "optionsSource": "countryList",
        "gridSize": 6
      },
      {
        "section": "Location Details",
        "fieldName": "State / Province",
        "fieldType": "Dropdown",
        "required": true,
        "binding": "object.state",
        "displayProperty": "name",
        "valueProperty": "code",
        "optionsSource": "stateList",
        "gridSize": 6
      },
      {
        "section": "Preferences",
        "fieldName": "Subscribe to Newsletter",
        "fieldType": "Checkbox",
        "required": false,
        "binding": "object.subscribeNewsletter",
        "gridSize": 12
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">React Dynamic Form Engine</h1>
            <p className="mt-2 text-gray-600">
                Renders forms from JSON, handles dependent API sources, and binds data automatically.
            </p>
        </div>
        <DynamicForm config={exampleConfig} />
      </div>
    </div>
  );
};

export default App;