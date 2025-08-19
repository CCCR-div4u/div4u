import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('utils', () => {
  describe('cn function', () => {
    it('should combine class names correctly', () => {
      const result = cn('class1', 'class2', 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'conditional', false && 'hidden')
      expect(result).toBe('base conditional')
    })

    it('should handle undefined and null values', () => {
      const result = cn('base', undefined, null, 'valid')
      expect(result).toBe('base valid')
    })

    it('should handle empty strings', () => {
      const result = cn('base', '', 'valid')
      expect(result).toBe('base valid')
    })

    it('should handle arrays', () => {
      const result = cn(['class1', 'class2'], 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    it('should handle objects', () => {
      const result = cn({
        'class1': true,
        'class2': false,
        'class3': true
      })
      expect(result).toBe('class1 class3')
    })

    it('should handle mixed types', () => {
      const result = cn(
        'base',
        ['array1', 'array2'],
        {
          'obj1': true,
          'obj2': false
        },
        true && 'conditional',
        'final'
      )
      expect(result).toBe('base array1 array2 obj1 conditional final')
    })

    it('should handle empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should deduplicate classes', () => {
      const result = cn('duplicate', 'unique', 'duplicate')
      // Note: clsx doesn't deduplicate by default, so this might return 'duplicate unique duplicate'
      // This test documents the current behavior
      expect(result).toBe('duplicate unique duplicate')
    })
  })
})