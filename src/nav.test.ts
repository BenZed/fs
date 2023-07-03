import {
    expect,
    describe,
    test,
    beforeAll,
    beforeEach,
    afterAll
} from '@jest/globals'

import * as TEST_DIR from './test-dir.util.test'

import { Nav } from './nav'

//// Setup ////

let testFile: Nav
let testDir: Nav
let jailDir: Nav
beforeAll(() => {
    testDir = new Nav(TEST_DIR.path)
    testFile = new Nav(TEST_DIR.resolve('riddle.txt'))
    jailDir = new Nav(TEST_DIR.resolve('poems'), true)
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
        const poemsDir = new Nav(TEST_DIR.path, TEST_DIR.resolve('poems'))

        expect(poemsDir.accessPath).toEqual(TEST_DIR.resolve('poems'))
    })
})

const { dir } = Nav.prototype
describe(dir.name, () => {
    test(`change directory`, () => {
        expect(testDir.dir('poems').path).toEqual(TEST_DIR.resolve('poems'))
    })
    test(`immutable`, () => {
        expect(testDir.dir('sub-dir')).not.toBe(testDir)
    })
    test(`uses path resolution`, () => {
        expect(
            testDir
                .dir('this/sub/dir/no/wait/too/far')
                .dir('../')
                .dir('../')
                .dir('../../').path
        ).toEqual(TEST_DIR.resolve('this/sub/dir'))
    })

    test(
        `.${'parent' satisfies keyof Nav} as an alias ` +
            `to ${dir.name}("../")`,
        () => {
            expect(testDir).toEqual(testDir.file('child').parent)
        }
    )

    test(`respects ${'accessPath' satisfies keyof Nav} property`, async () => {
        const subDir = jailDir.file('./child')
        expect(subDir.accessPath).toEqual(jailDir.accessPath)
    })
})

const { isDir } = Nav.prototype
test(isDir.name, () => {
    expect(jailDir.isDir()).toBe(true)
    expect(testFile.isFile()).toBe(false)
})

const { file } = Nav.prototype
describe(file.name, () => {
    test(`nav to file`, () => {
        expect(testFile.dir('../poems').path).toEqual(TEST_DIR.resolve('poems'))
    })
    test(`immutable`, () => {
        expect(testFile.file('../riddle.txt')).not.toBe(testFile)
    })

    test(
        `.${'parent' satisfies keyof Nav} as an alias ` +
            `to ${file.name}("../")`,
        () => {
            expect(testDir).toEqual(testDir.file('child').parent)
        }
    )

    test(`respects ${'accessPath' satisfies keyof Nav} property`, async () => {
        const subFile = jailDir.file('cake.txt')
        expect(subFile.accessPath).toEqual(jailDir.accessPath)
    })
})

const { isFile } = Nav.prototype
test(isFile.name, () => {
    expect(testDir.isFile()).toBe(false)
    expect(testDir.file('text.js').isFile()).toBe(true)
})

const { eachParent } = Nav.prototype
describe(eachParent.name, () => {
    test('iterates each parent', () => {
        const parents = [...testDir.eachParent()]
        expect(parents.length).toBeGreaterThan(0)
    })

    test('up until accessPath', () => {
        const parents = [...jailDir.eachParent()]
        expect(parents).toEqual([jailDir.parent])
    })
})

const { remove } = Nav.prototype
describe(remove.name, () => {
    test(`delete file`, async () => {
        await testDir.remove('riddle.txt')
        await expect(TEST_DIR.fileExists('riddle.txt')).resolves.toBe(false)
    })

    test(`returns true if deletion ocurred`, async () => {
        const removeOcurred = await testDir.remove('riddle.txt')
        expect(removeOcurred).toBe(true)
    })

    test(`returns false if no deletion ocurred`, async () => {
        const removeOcurred = await testDir.remove(
            'good-reasons-to-use-php.csv'
        )
        expect(removeOcurred).toBe(false)
    })

    test(`delete directory`, async () => {
        const existsBeforeRemoval = await testDir.dir('poems').exists()

        const removeOcurred = await testDir.remove('poems')
        expect(removeOcurred).toBe(true)

        const filesAfterRemoval = await testDir.dir('poems').exists()
        expect(existsBeforeRemoval).not.toEqual(filesAfterRemoval)
    })

    test(`respects ${'accessPath' satisfies keyof Nav} property`, async () => {
        const forbiddenDir = jailDir.file('../poem')

        await expect(forbiddenDir.remove()).rejects.toThrow(
            `EACCES: permission denied, access '${forbiddenDir}'`
        )
    })
})
