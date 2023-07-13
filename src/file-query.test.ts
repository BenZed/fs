import { test, expect, describe } from '@jest/globals'

import { fromFileQuery, toFileQuery, toReadFilter } from './file-query'

//// Tests ////

describe(toFileQuery.name, () => {
    //
    describe('ext', () => {
        test('single', () => {
            expect(toFileQuery('?ext=ts')).toEqual({
                depth: 1,
                ext: '.ts'
            })
        })
        test('multiple', () => {
            expect(toFileQuery('?ext=ts,js,json')).toEqual({
                depth: 1,
                ext: ['.ts', '.js', '.json']
            })
        })

        test('no whitespace', () => {
            const encodedGetTextFilesQuery = '?ext=markdown file,txt'

            expect(toFileQuery(encodedGetTextFilesQuery)).toEqual({
                depth: 1,
                ext: '.txt'
            })
        })
    })

    for (const key of ['name', 'contains'])
        describe(key, () => {
            test('single', () => {
                expect(toFileQuery(`?${key}=final`)).toEqual({
                    depth: 1,
                    [key]: 'final'
                })
            })
            test('multiple', () => {
                expect(toFileQuery(`?${key}=before,after`)).toEqual({
                    depth: 1,
                    [key]: ['before', 'after']
                })
            })
            test('allows whitespace', () => {
                expect(
                    toFileQuery(`?${key}=final v1,FINAL V2,FinalFinal`)
                ).toEqual({
                    depth: 1,
                    [key]: ['final v1', 'FINAL V2', 'FinalFinal']
                })
            })
        })

    describe('depth', () => {
        test('as number', () => {
            expect(toFileQuery('?depth=5')).toEqual({ depth: 5 })
        })

        test('from recursive', () => {
            expect(toFileQuery('?recursive=true')).toEqual({ depth: Infinity })
        })

        test('from recursive false', () => {
            expect(toFileQuery('?recursive=false')).toEqual({ depth: 1 })
        })

        test('from recursive not boolean', () => {
            expect(toFileQuery('?recursive=ace')).toEqual({ depth: 1 })
        })

        test('recursive overrides depth', () => {
            expect(toFileQuery('?depth=5&recursive=true')).toEqual({
                depth: Infinity
            })
            expect(toFileQuery('?recursive=true&depth=5')).toEqual({
                depth: Infinity
            })
        })
        test('handles NaN', () => {
            expect(toFileQuery('?depth=ace')).toEqual({
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

        expect(toFileQuery(encodedGetTextFilesQuery)).toEqual({
            depth: 5,
            ext: ['.md', '.txt', '.rtf', '.doc'],
            name: ['Final', 'Final V2', 'Final_V3', 'Final for-real']
        })
    })
})

describe(fromFileQuery.name, () => {
    for (const fileQueryString of [
        '?ext=ts',
        '?name=Boo',
        '?contains=Arms,Legs',
        '?ext=md,txt&name=README&recursive=true'
    ])
        test(fileQueryString, () => {
            const fileQuery = toFileQuery(fileQueryString)
            expect(fromFileQuery(fileQuery)).toEqual(fileQueryString)
        })
})

describe(toReadFilter.name, () => {
    test.todo('files by extension')
    test.todo('files by name')
    test.todo('files by contents')
    test.todo('depth')
})
