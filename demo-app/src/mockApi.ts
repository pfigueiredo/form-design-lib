import { ApiProvider } from 'form-design-lib'

/**
 * Mock API provider for demo purposes
 * In production, replace this with your actual API implementation
 */
export const mockApiProvider: ApiProvider = {
  call: async (endpoint: string, method: string = 'GET') => {
    console.log(`[API] ${method} ${endpoint}`)

    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Mock implementations
    if (endpoint === '/api/countries') {
      return [
        { code: 'US', name: 'United States' },
        { code: 'CA', name: 'Canada' },
        { code: 'DE', name: 'Germany' },
        { code: 'JP', name: 'Japan' },
      ]
    }

    if (endpoint.includes('/api/states')) {
      const url = new URL(`http://mock${endpoint}`)
      const country = url.searchParams.get('country')

      const states: Record<string, Array<{ code: string; name: string }>> = {
        US: [
          { code: 'NY', name: 'New York' },
          { code: 'CA', name: 'California' },
          { code: 'TX', name: 'Texas' },
        ],
        CA: [
          { code: 'ON', name: 'Ontario' },
          { code: 'QC', name: 'Quebec' },
        ],
        DE: [
          { code: 'BE', name: 'Berlin' },
          { code: 'BY', name: 'Bavaria' },
        ],
        JP: [
          { code: 'TK', name: 'Tokyo' },
          { code: 'OS', name: 'Osaka' },
        ],
      }
      return states[country || ''] || []
    }

    if (endpoint.match(/\/api\/Users\/\w+/)) {
      // Get today's date for DateRange fields
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      
      // Calculate dates for date ranges
      const nextMonth = new Date(today)
      nextMonth.setMonth(today.getMonth() + 1)
      const nextMonthStr = nextMonth.toISOString().split('T')[0]
      
      // For project timeline - use fixed dates within the allowed range
      const projectStart = '2024-06-01'
      const projectEnd = '2024-12-31'

      return {
        // Existing fields
        userId: '123', // Added for List field dependency
        username: 'jdoe_existing',
        email: 'john.doe@example.com',
        subscribeNewsletter: true,
        country: 'US',
        state: 'NY',
        dateOfBirth: '1990-05-15',
        
        // Number fields
        age: 34,
        yearsOfExperience: 8,
        salary: 95000,
        
        // Textarea fields
        bio: 'Experienced software developer with a passion for creating innovative solutions. Specialized in full-stack development and modern web technologies.',
        notes: 'Available for remote work. Open to relocation for the right opportunity. Prefer working with modern JavaScript frameworks and cloud technologies.',
        
        // Radio fields
        experienceLevel: 'advanced',
        primaryInterest: 'tech',
        
        // MultiSelect fields
        skills: ['javascript', 'typescript', 'react', 'node'],
        interests: ['tech', 'reading', 'travel'],
        
        // DateRange fields - these are objects with startDate and endDate
        availablePeriod: {
          startDate: todayStr,
          endDate: nextMonthStr,
        },
        projectTimeline: {
          startDate: projectStart,
          endDate: projectEnd,
        },
        
        // Note: File fields cannot be populated from API (they require File objects)
        // profilePicture, resume, and portfolioFiles will remain null/undefined
      }
    }

    // Options for Radio and MultiSelect fields
    if (endpoint === '/api/interests') {
      return [
        { value: 'tech', label: 'Technology' },
        { value: 'sports', label: 'Sports' },
        { value: 'music', label: 'Music' },
        { value: 'travel', label: 'Travel' },
        { value: 'reading', label: 'Reading' },
        { value: 'cooking', label: 'Cooking' },
      ]
    }

    if (endpoint === '/api/skills') {
      return [
        { value: 'javascript', label: 'JavaScript' },
        { value: 'typescript', label: 'TypeScript' },
        { value: 'react', label: 'React' },
        { value: 'node', label: 'Node.js' },
        { value: 'python', label: 'Python' },
        { value: 'java', label: 'Java' },
        { value: 'css', label: 'CSS' },
        { value: 'html', label: 'HTML' },
      ]
    }

    if (endpoint === '/api/experience-levels') {
      return [
        { value: 'beginner', label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'advanced', label: 'Advanced' },
        { value: 'expert', label: 'Expert' },
      ]
    }

    if (endpoint === '/api/employment-types') {
      return [
        { value: 'employed', label: 'Employed' },
        { value: 'freelance', label: 'Freelance' },
        { value: 'student', label: 'Student' },
        { value: 'unemployed', label: 'Unemployed' },
      ]
    }

    // Experience list endpoint - returns array of work experience items
    if (endpoint.match(/\/api\/userExperience\/\w+/)) {
      return [
        {
          employer: 'Tech Solutions Inc.',
          position: 'Senior Software Engineer',
          startDate: '2020-01-15',
          endDate: '2023-06-30',
          description: 'Led development of microservices architecture. Mentored junior developers and improved code quality standards.',
          location: 'San Francisco, CA',
        },
        {
          employer: 'Digital Innovations LLC',
          position: 'Full Stack Developer',
          startDate: '2017-03-01',
          endDate: '2019-12-31',
          description: 'Developed responsive web applications using React and Node.js. Collaborated with cross-functional teams to deliver high-quality products.',
          location: 'New York, NY',
        },
        {
          employer: 'StartupXYZ',
          position: 'Frontend Developer',
          startDate: '2015-08-01',
          endDate: '2017-02-28',
          description: 'Built user interfaces for SaaS platform. Implemented modern UI/UX patterns and improved application performance.',
          location: 'Austin, TX',
        },
      ]
    }

    return null
  },
}
