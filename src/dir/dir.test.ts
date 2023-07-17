import {
    expect,
    describe,
    test,
    beforeAll,
    beforeEach,
    afterAll
} from '@jest/globals'

import * as TEST_DIR from '../test-dir.util.test'

import { Dir } from './dir'
import { File } from '../file'

//// Setup ////

let testDir: Dir
let jailDir: Dir
beforeAll(() => {
    testDir = new Dir(TEST_DIR.path)
    jailDir = new Dir(TEST_DIR.resolve('poems'), true)
})
beforeEach(TEST_DIR.reset)
afterAll(TEST_DIR.erase)

//// Tests ////

describe('construct', () => {
    test('path', () => {
        expect(testDir.path).toEqual(TEST_DIR.path)
    })

    test('restrict', () => {
        expect(jailDir.accessPath).toEqual(jailDir.path)
    })

    test('restrict specific path path', () => {
        const poemsDir = new Dir(TEST_DIR.path, TEST_DIR.resolve('poems'))
        expect(poemsDir.accessPath).toEqual(TEST_DIR.resolve('poems'))
    })
})

const { files } = Dir.prototype
describe(files.name, () => {
    test(`get a list of contained files`, async () => {
        const files: File[] = await testDir.files()
        expect(files).toEqual([
            testDir.file('joke.txt'),
            testDir.file('readme.md'),
            testDir.file('riddle.txt')
        ])
    })

    test(`options`, async () => {
        const files = await testDir.files({ recursive: true })
        expect(files).toEqual([
            testDir.file('joke.txt'),
            testDir.file('poems/haiku.txt'),
            testDir.file('poems/limerick.txt'),
            testDir.file('poems/readme.md'),
            testDir.file('poems/sonnet.txt'),
            testDir.file('poems/wip/nursery-rhyme.txt'),
            testDir.file('readme.md'),
            testDir.file('riddle.txt')
        ])
    })
})

const { dirs } = Dir.prototype
describe(dirs.name, () => {
    test(`get a list of contained files`, async () => {
        const dirs: Dir[] = await testDir.dirs()
        expect(dirs).toEqual([
            // only 1
            testDir.file('poems')
        ])
    })

    test(`options.recursive true`, async () => {
        const dirs = await testDir.dirs({ recursive: true })
        expect(dirs).toEqual([
            // only 2
            testDir.file('poems'),
            testDir.file('poems/wip')
        ])
    })

    test(`options.recursive false`, async () => {
        const dirs = await testDir.dirs({ recursive: false })
        expect(dirs).toEqual([
            // only 1
            testDir.file('poems')
        ])
    })
})

const { each } = Dir.prototype
describe(each.name, () => {
    test(`iterate through contents`, async () => {
        const contents: unknown[] = []
        for await (const content of testDir.each()) contents.push(content)

        expect(contents).toEqual(await testDir.each().toArray())
    })

    test(`throws on invalid depth argument`, async () => {
        try {
            for await (const thing of testDir.each({ depth: 0 })) void thing
        } catch (e) {
            expect(e).toHaveProperty(
                'message',
                `depth must be an integer greater than 0`
            )
        }
        expect.assertions(1)
    })

    test('optional filter argument', async () => {
        for await (const file of testDir.each((f): f is File => f.isFile())) {
            expect(file.isFile()).toBe(true)
            file satisfies File
        }
    })

    test(`respects ${'accessPath' satisfies keyof Dir} property`, async () => {
        const forbiddenDir = jailDir.dir('../')
        try {
            for await (const thing of forbiddenDir.each()) void thing
        } catch (e) {
            expect(e).toHaveProperty(
                'message',
                `EACCES: permission denied, access '${forbiddenDir.path}'`
            )
        }
        expect.assertions(1)
    })
})

test(`${Dir.name}.${Dir.from.name}`, () => {
    expect(Dir.from('a', 'b', 'c')).toEqual(new Dir('a/b/c'))
})
