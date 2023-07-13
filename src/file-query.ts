import * as QueryString from 'query-string'

import { toDepth, type DepthOptions, type ReadFilter } from './dir'

//// Types ////

/**
 * File search parameters as a serializable
 * alternative to a {@link ReadFilter}
 */
type FileQuery = DepthOptions & {
    //
    readonly ext?: string | string[]
    readonly name?: string | string[]
    readonly contains?: string | string[]
}

type FileQueryString = string

//// Constants ////

const DEFAULT_ARRAY_FORMAT =
    'comma' satisfies QueryString.ParseOptions['arrayFormat']

//// Main ////

export function toFileQuery(
    fileQueryString: FileQueryString,
    options?: QueryString.ParseOptions
): FileQuery {
    const object = QueryString.parse(fileQueryString, {
        arrayFormat: DEFAULT_ARRAY_FORMAT,
        parseNumbers: true,
        parseBooleans: true,
        ...options
    })

    const { ext, name, contains, ...depthOptions } = object

    return {
        ext: toExt(ext),
        name: toHumanString(name),
        contains: toHumanString(contains),

        depth: toDepth(depthOptions)
    }
}

export function fromFileQuery(fileQuery: FileQuery): string {
    // ignore redundant depth
    if ('depth' in fileQuery && fileQuery.depth === 1)
        fileQuery = { ...fileQuery, depth: undefined }

    // convert depth=Infinity to recursive=true
    if ('depth' in fileQuery && fileQuery.depth === Infinity) {
        fileQuery = { ...fileQuery, depth: undefined, recursive: true }
    }

    // strip extension dots
    fileQuery = {
        ...fileQuery,
        ext: toStrings(fileQuery.ext).map(ext => ext.replace(/^\./, ''))
    }

    const fileQueryString = QueryString.stringify(fileQuery, {
        arrayFormat: DEFAULT_ARRAY_FORMAT
    })

    return '?' + fileQueryString
}

export function toReadFilter(
    fileQueryOrString: FileQuery | FileQueryString
): ReadFilter {
    const fileQuery =
        typeof fileQueryOrString === 'string'
            ? toFileQuery(fileQueryOrString)
            : fileQueryOrString

    throw new Error('not yet implemented')
}

//// Helper ////

function toExt(input: unknown) {
    const exts = toStrings(input)
        // prefixed by '.'
        .map(str => (str.startsWith('.') ? str : '.' + str))
        // no whitespace
        .filter(str => !/\s/.test(str))

    return preferSingleValue(exts)
}

function toHumanString(input: unknown) {
    const names = toStrings(input)
    return preferSingleValue(names)
}

function toStrings(input: unknown): string[] {
    const raw: unknown[] = Array.isArray(input) ? input : [input]

    const sanitized = raw.filter((i): i is string => typeof i === 'string')
    return sanitized
}

function preferSingleValue<T>(input: T[]): undefined | T | T[] {
    return input.length > 1 ? input : input.at(0)
}
