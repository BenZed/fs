import { it, expect } from '@jest/globals'

import { isRelative } from './is-relative'

//// Tests ////

it('should return true for a relative path', () => {
    expect(isRelative('./src', './src/util')).toBe(true)
})

it('should return false for non relative path', () => {
    expect(isRelative('/usr/src', '/usr/lib')).toBe(false)
})

it('should return true for same path', () => {
    expect(isRelative('/usr/', '/usr/')).toBe(true)
})
