import { test, expect, describe, beforeEach, afterAll } from '@jest/globals'

import {
    eachOptionsToQueryString,
    queryStringToEachOptions,
    toEachFilter
} from './each-options'

import * as TEST_DIR from '../test-dir.util.test'
import { Dir } from '.'

//// Tests ////

describe(queryStringToEachOptions.name, () => {
    //
    describe('ext', () => {
        test('single', () => {
            expect(queryStringToEachOptions('?ext=ts')).toEqual({
                depth: 1,
                ext: '.ts'
            })
        })
        test('multiple', () => {
            expect(queryStringToEachOptions('?ext=ts,js,json')).toEqual({
                depth: 1,
                ext: ['.ts', '.js', '.json']
            })
        })

        test('no whitespace', () => {
            const encodedGetTextFilesQuery = '?ext=markdown file,txt'

            expect(queryStringToEachOptions(encodedGetTextFilesQuery)).toEqual({
                depth: 1,
                ext: '.txt'
            })
        })
    })

    for (const key of ['name' /*, 'contains'*/])
        describe(key, () => {
            test('single', () => {
                expect(queryStringToEachOptions(`?${key}=final`)).toEqual({
                    depth: 1,
                    [key]: 'final'
                })
            })
            test('multiple', () => {
                expect(
                    queryStringToEachOptions(`?${key}=before,after`)
                ).toEqual({
                    depth: 1,
                    [key]: ['before', 'after']
                })
            })
            test('allows whitespace', () => {
                expect(
                    queryStringToEachOptions(
                        `?${key}=final v1,FINAL V2,FinalFinal`
                    )
                ).toEqual({
                    depth: 1,
                    [key]: ['final v1', 'FINAL V2', 'FinalFinal']
                })
            })
        })

    describe('depth', () => {
        test('as number', () => {
            expect(queryStringToEachOptions('?depth=5')).toEqual({ depth: 5 })
        })

        test('from recursive', () => {
            expect(queryStringToEachOptions('?recursive=true')).toEqual({
                depth: Infinity
            })
        })

        test('from recursive false', () => {
            expect(queryStringToEachOptions('?recursive=false')).toEqual({
                depth: 1
            })
        })

        test('from recursive not boolean', () => {
            expect(queryStringToEachOptions('?recursive=ace')).toEqual({
                depth: 1
            })
        })

        test('recursive overrides depth', () => {
            expect(queryStringToEachOptions('?depth=5&recursive=true')).toEqual(
                {
                    depth: Infinity
                }
            )
            expect(queryStringToEachOptions('?recursive=true&depth=5')).toEqual(
                {
                    depth: Infinity
                }
            )
        })
        test('handles NaN', () => {
            expect(queryStringToEachOptions('?depth=ace')).toEqual({
                depth: 1
            })
        })
    })

    test('decodes uris', () => {
        const encodedGetTextFilesQuery =
            `?ext=${encodeURIComponent('md,txt,rtf,doc')}` +
            `&name=${encodeURIComponent(
                'Final,Final V2,Final_V3,Final for-real'
            )}` +
            `&depth=${encodeURIComponent(5)}`

        expect(queryStringToEachOptions(encodedGetTextFilesQuery)).toEqual({
            depth: 5,
            ext: ['.md', '.txt', '.rtf', '.doc'],
            name: ['Final', 'Final V2', 'Final_V3', 'Final for-real']
        })
    })
})

describe(eachOptionsToQueryString.name, () => {
    for (const fileQueryString of [
        '?ext=ts',
        '?name=Boo',
        // '?contains=Arms,Legs',
        '?ext=md,txt&name=README&recursive=true'
    ])
        test(fileQueryString, () => {
            const fileQuery = queryStringToEachOptions(fileQueryString)
            expect(eachOptionsToQueryString(fileQuery)).toEqual(fileQueryString)
        })
})

describe(toEachFilter.name, () => {
    beforeEach(TEST_DIR.reset)
    afterAll(TEST_DIR.erase)

    const dir: Dir = Dir.from(TEST_DIR.path)

    test('files by extension', async () => {
        const getReadmes = toEachFilter({ ext: ['.md'] })

        const readmes = await dir
            .each({ recursive: true }, getReadmes)
            .toArray()
        expect(readmes).toHaveLength(2)
    })

    // test('files by extension via querystring input', async () => {
    //     const getReadmes = toEachFilter('ext=md')

    //     const readmes = await dir
    //         .each({ recursive: true }, getReadmes)
    //         .toArray()
    //     expect(readmes).toHaveLength(2)
    // })

    //
    test('files by name', async () => {
        const getRiddles = toEachFilter({ name: 'riddle' })

        const readmes = await dir
            .each({ recursive: true }, getRiddles)
            .toArray()
        expect(readmes).toHaveLength(1)
    })

    // test('files by name via querystring input', async () => {
    //     const getRiddles = toEachFilter('name=riddle')

    //     const readmes = await dir
    //         .each({ recursive: true }, getRiddles)
    //         .toArray()
    //     expect(readmes).toHaveLength(1)
    // })

    //
    test.todo('files by contents')
})
