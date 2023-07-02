import {
    expect,
    describe,
    test,
    beforeEach,
    afterAll,
    beforeAll
} from '@jest/globals'

import * as TEST_DIR from './test-dir.util.test'

import { Stat } from './stat'

import * as fs from 'fs/promises'

//// Setup ////

let dir: Stat
let jailDir: Stat
let missingDir: Stat
beforeAll(() => {
    dir = new Stat(TEST_DIR.path)
    jailDir = new Stat(TEST_DIR.path, true)
    missingDir = new Stat(TEST_DIR.resolve('non-existent'))
})

beforeEach(TEST_DIR.reset)
afterAll(TEST_DIR.erase)

//// Tests ////

describe('new ' + Stat.name, () => {
    test('path argument', () => {
        expect(dir.path).toEqual(TEST_DIR.path)
    })

    test('restrict=true argument', () => {
        expect(jailDir.accessPath).toEqual(TEST_DIR.path)
    })

    test('restrict=false argument', () => {
        const explicitNonJailDir = new Stat(TEST_DIR.path, false)
        expect(explicitNonJailDir.accessPath).not.toBeDefined()
    })
})

const { stat } = Stat.prototype
describe(stat.name, () => {
    test(`get stats`, async () => {
        const stat = await dir.stat()
        expect(stat).toEqual(await fs.stat(TEST_DIR.path))
    })
    test(`optional relative path`, async () => {
        const s = await dir.stat('joke.txt')
        expect(s).toEqual(await fs.stat(TEST_DIR.resolve('joke.txt')))
    })
})

const { exists } = Stat.prototype
describe(exists.name, () => {
    test(`returns true if dir exists on the file system`, async () => {
        await expect(dir.exists()).resolves.toBe(true)
    })
    test(`returns true if relative path exists`, async () => {
        await expect(dir.exists('poems')).resolves.toBe(true)
    })
    test(`returns false for non-existent paths`, async () => {
        await expect(dir.exists('bad-johnny-depp-movies.txt')).resolves.toBe(
            false
        )
    })
})

const { isFile } = Stat.prototype
describe(isFile.name, () => {
    test(`returns true if the given path is a file`, async () => {
        await expect(dir.isFile('joke.txt')).resolves.toBe(true)
    })
    test(`returns false otherwise`, async () => {
        await expect(dir.isFile('poem')).resolves.toBe(false)
    })
})

const { isDirectory } = Stat.prototype
describe(isDirectory.name, () => {
    test(`returns true if the given path is a directory`, async () => {
        await expect(dir.isDirectory()).resolves.toBe(true)
    })
    test(`returns false otherwise`, async () => {
        await expect(missingDir.isDirectory()).resolves.toBe(false)
    })
})

const { isAccessible } = Stat.prototype
describe(isAccessible.name, () => {
    test(`returns true if path is accessible`, () => {
        expect(jailDir.isAccessible('../')).toBe(false)
    })
    test(`returns false if path is not accessible`, () => {
        expect(dir.isAccessible('../')).toBe(true)
    })
})

const { assertAccessible } = Stat.prototype
describe(assertAccessible.name, () => {
    test(`throws if not within the provided accessPath`, () => {
        expect(() => jailDir.assertAccessible('../')).toThrow(
            'permission denied'
        )
    })
    test(`does not throw otherwise`, () => {
        expect(jailDir.assertAccessible()).toBe(undefined)
    })
    test(`works with provided relative path`, () => {
        expect(jailDir.assertAccessible('poem')).toBe(undefined)
    })
})
