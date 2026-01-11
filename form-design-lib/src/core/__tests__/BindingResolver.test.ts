import { describe, it, expect } from 'vitest'
import { BindingResolver } from '../BindingResolver'

describe('BindingResolver - Complex Nested Bindings', () => {
  const resolver = new BindingResolver()

  describe('Complex nested paths with multiple array indices', () => {
    it('should handle root.child.mylist[1].mylist2[2]', () => {
      const store = {
        root: {
          child: {
            mylist: [
              {},
              {
                mylist2: [
                  {},
                  {},
                  { value: 'test-value' }
                ]
              }
            ]
          }
        }
      }

      // Test resolve
      const value = resolver.resolve('root.child.mylist[1].mylist2[2]', store)
      expect(value).toEqual({ value: 'test-value' })

      // Test parse
      const parsed = resolver.parse('root.child.mylist[1].mylist2[2]')
      expect(parsed.rootSource).toBe('root')
      expect(parsed.relativePath).toBe('child.mylist[1].mylist2[2]')
      expect(parsed.isArrayPath).toBe(true)
      expect(parsed.arrayIndices).toEqual([1, 2])

      // Test set
      const newStore = resolver.set('root.child.mylist[1].mylist2[2].value', 'new-value', store)
      expect(newStore.root.child.mylist[1].mylist2[2].value).toBe('new-value')
    })

    it('should handle object.userExperience[0].subItems[1].property', () => {
      const store = {
        object: {
          userExperience: [
            {
              employer: 'Company A',
              subItems: [
                { name: 'Item 1' },
                { name: 'Item 2', property: 'original-value' }
              ]
            }
          ]
        }
      }

      // Test resolve
      const value = resolver.resolve('object.userExperience[0].subItems[1].property', store)
      expect(value).toBe('original-value')

      // Test set
      const newStore = resolver.set('object.userExperience[0].subItems[1].property', 'updated-value', store)
      expect(newStore.object.userExperience[0].subItems[1].property).toBe('updated-value')
    })

    it('should create intermediate structures when setting nested paths', () => {
      const store = {
        root: {}
      }

      // Set a deeply nested value - should create all intermediate structures
      const newStore = resolver.set('root.child.mylist[1].mylist2[2].value', 'deep-value', store)
      
      expect(newStore.root.child).toBeDefined()
      expect(Array.isArray(newStore.root.child.mylist)).toBe(true)
      expect(newStore.root.child.mylist.length).toBeGreaterThanOrEqual(2)
      expect(newStore.root.child.mylist[1]).toBeDefined()
      expect(Array.isArray(newStore.root.child.mylist[1].mylist2)).toBe(true)
      expect(newStore.root.child.mylist[1].mylist2.length).toBeGreaterThanOrEqual(3)
      expect(newStore.root.child.mylist[1].mylist2[2].value).toBe('deep-value')
    })

    it('should handle even deeper nesting', () => {
      const store = {
        data: {
          level1: [
            {
              level2: [
                {
                  level3: [
                    { value: 'deep-value' }
                  ]
                }
              ]
            }
          ]
        }
      }

      const value = resolver.resolve('data.level1[0].level2[0].level3[0].value', store)
      expect(value).toBe('deep-value')

      const newStore = resolver.set('data.level1[0].level2[0].level3[0].value', 'new-deep-value', store)
      expect(newStore.data.level1[0].level2[0].level3[0].value).toBe('new-deep-value')
    })
  })

  describe('Edge cases', () => {
    it('should handle paths starting with array index', () => {
      const store = {
        mylist: [
          {},
          {
            mylist2: [
              {},
              {},
              { value: 'test' }
            ]
          }
        ]
      }

      const value = resolver.resolve('mylist[1].mylist2[2].value', store)
      expect(value).toBe('test')
    })

    it('should return undefined for non-existent paths', () => {
      const store = {
        root: {}
      }

      const value = resolver.resolve('root.child.mylist[1].mylist2[2]', store)
      expect(value).toBeUndefined()
    })
  })
})
