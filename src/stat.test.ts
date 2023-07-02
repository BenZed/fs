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
beforeAll(() => {
    dir = new Stat(TEST_DIR.path)
    jailDir = new Stat(TEST_DIR.path, true)
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

const { stats } = Stat.prototype
describe(stats.name, () => {
    test(`get stats`, async () => {
        const stat = await dir.stats()
        expect(stat).toEqual(await fs.stat(TEST_DIR.path))
    })
    test(`optional relative path`, async () => {
        const s = await dir.stats('joke.txt')
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

const { isInAccessPath } = Stat.prototype
describe(isInAccessPath.name, () => {
    test(`returns true if path is accessible`, () => {
        expect(jailDir.isInAccessPath('../')).toBe(false)
    })
    test(`returns false if path is not accessible`, () => {
        expect(dir.isInAccessPath('../')).toBe(true)
    })
})

const { assertInAccessPath } = Stat.prototype
describe(assertInAccessPath.name, () => {
    test(`throws if not within the provided accessPath`, () => {
        expect(() => jailDir.assertInAccessPath('../')).toThrow(
            'permission denied'
        )
    })
    test(`does not throw otherwise`, () => {
        expect(jailDir.assertInAccessPath()).toBe(undefined)
    })
    test(`works with provided relative path`, () => {
        expect(jailDir.assertInAccessPath('poem')).toBe(undefined)
    })
})
