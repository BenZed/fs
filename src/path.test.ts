import { beforeAll, test, expect, describe } from '@jest/globals'

import * as TEST_DIR from './test-dir.util.test'

import { Path } from './path'

import * as path from 'path'

//// Setup ////

let testDir: Path
beforeAll(() => {
    testDir = new Path(TEST_DIR.path)
})

//// Tests ////

describe(`new ${Path.name}`, () => {
    test(`sets ${'path' satisfies keyof Path}`, () => {
        expect(testDir.path).toEqual(TEST_DIR.path)
    })

    test('name' satisfies keyof Path, () => {
        expect(testDir.name).toEqual(path.parse(TEST_DIR.path).name)
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
        expect(testDir.isRelative(TEST_DIR.resolve('child'))).toBe(true)
    })
    test(`returns false for non relative paths`, () => {
        expect(testDir.isRelative(TEST_DIR.resolve('../'))).toBe(false)
    })
    test(`returns true same path`, () => {
        expect(testDir.isRelative(TEST_DIR.path)).toBe(true)
    })
})

const { relative } = Path.prototype
describe(relative.name, () => {
    test(`gets the path of the input relative to this location`, () => {
        //
        const a = new Path(testDir.relative('a'))
        const b = new Path(a.resolve('to', 'b'))

        const aToB = a.relative(b.path)
        expect(aToB).toEqual('to/b')
        expect(a.resolve(aToB)).toEqual(b.path)

        const bToA = b.relative(a.path)
        expect(bToA).toEqual('../..')
        expect(b.resolve(bToA)).toEqual(a.path)
    })
})

const { resolve } = Path.prototype
test(resolve.name, () => {
    expect(testDir.resolve('sub', 'dir')).toEqual(
        path.resolve(testDir.path, 'sub', 'dir')
    )
})

describe('built-ins', () => {
    const { toString } = Path.prototype
    test(toString.name, () => {
        expect(testDir.toString()).toEqual(TEST_DIR.path)
    })

    const { toJSON } = Path.prototype
    test(toJSON.name, () => {
        expect(JSON.stringify(testDir)).toEqual(
            JSON.stringify({ path: TEST_DIR.path })
        )
    })
})

describe(Path.name + ' static', () => {
    test(Path.isAbsolute.name, () =>
        expect(Path.isAbsolute).toBe(path.isAbsolute)
    )

    test(Path.isRelative.name, () =>
        expect(Path.isAbsolute).toBe(path.isAbsolute)
    )

    test(Path.resolve.name, () => {
        expect(Path.resolve('/ace', 'of', 'base')).toEqual('/ace/of/base')

        expect(Path.resolve('ace', 'of', 'base')).toEqual(
            process.cwd() + '/ace/of/base'
        )

        expect(Path.resolve({ path: '/ace/of/base' })).toEqual('/ace/of/base')
        expect(Path.resolve({ path: '/ace/of/base' }, 'chase')).toEqual(
            '/ace/of/base/chase'
        )

        expect(Path.resolve({ path: '/ace' }, { path: '/of/base' })).toEqual(
            '/of/base'
        )
    })
})
