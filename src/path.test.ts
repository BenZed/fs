import { beforeAll, test, expect, describe } from '@jest/globals'

import * as TEST_DIR from './test-dir.util.test'

import { Path } from './path'

import * as path from 'path'

//// Setup ////

let dir: Path
beforeAll(() => {
    dir = new Path(TEST_DIR.path)
})

//// Tests ////

describe(`new ${Path.name}`, () => {
    test(`sets ${'path' satisfies keyof Path}`, () => {
        expect(dir.path).toEqual(TEST_DIR.path)
    })

    test('name' satisfies keyof Path, () => {
        expect(dir.name).toEqual(path.parse(TEST_DIR.path).name)
    })

    test('relative paths are resolved from process.cwd()', () => {
        expect(new Path('hello').path).toEqual(
            path.resolve(process.cwd(), 'hello')
        )
    })
})

const { isRelative } = Path.prototype
describe(isRelative.name, () => {
    test(`returns true for relative paths`, () => {
        expect(dir.isRelative(TEST_DIR.resolve('child'))).toBe(true)
    })
    test(`returns false for non relative paths`, () => {
        expect(dir.isRelative(TEST_DIR.resolve('../'))).toBe(false)
    })
    test(`returns true same path`, () => {
        expect(dir.isRelative(TEST_DIR.path)).toBe(true)
    })
})

const { resolve } = Path.prototype
test(resolve.name, () => {
    expect(dir.resolve('sub', 'dir')).toEqual(
        path.resolve(dir.path, 'sub', 'dir')
    )
})

describe('built-ins', () => {
    const { toString } = Path.prototype
    test(toString.name, () => {
        expect(dir.toString()).toEqual(TEST_DIR.path)
    })

    const { toJSON } = Path.prototype
    test(toJSON.name, () => {
        expect(JSON.stringify(dir)).toEqual(
            JSON.stringify({ path: TEST_DIR.path })
        )
    })
})
