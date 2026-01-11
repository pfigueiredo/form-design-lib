As a developer i want to be able to have subsessions with data provided from an API

example config:

```

{
    formName: 'User Registration',
    sources: [
      ...
      {
        sourceName: 'experienceList',
        sourceType: 'API',
        parameters: { id: 'object.userId' }, //make also sure that the mockapi returns a userId
        endpoint: '/api/userExperience/{id}',
      }
    ]
    fields: [
        {
            section: 'User Information',
            fieldName: 'Username',
            fieldType: 'Text',
            required: true,
            ...
        }
        {
            fieldName: "experience",
            section: 'Experience',
            fieldType: "List",
            binding: "userExperience",
            listSource: "experienceList"
            itemObject: "experienceItem",
            fields: [
                {
                    section: 'Experience',
                    fieldName: 'Employeer',
                    fieldType: 'Text',
                    required: true,
                    ...
                },
                ...
            ]
        }
    ]

}

```