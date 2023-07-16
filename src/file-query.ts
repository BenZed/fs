import * as QueryString from 'query-string'

import { toDepth, type DepthOptions, type FileFilter } from './dir'
import { File } from './file'

//// Types ////

/**
 * File search parameters as a serializable
 * alternative to a {@link ReadFilter}
 */
type FileQuery = DepthOptions & {
    //
    readonly ext?: string | string[]
    readonly name?: string | string[]
    // readonly contains?: string | string[]
    // readonly size?: number | [number, number] // range
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

    const { ext, name, /*contains,*/ ...depthOptions } = object

    return {
        ext: toExt(ext),
        name: toHumanString(name),
        // contains: toHumanString(contains),

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

export function toFileFilter(
    fileQueryOrString: FileQuery | FileQueryString
): FileFilter {
    const query =
        typeof fileQueryOrString === 'string'
            ? toFileQuery(fileQueryOrString)
            : fileQueryOrString

    return (file): file is File => {
        if (!file.isFile()) return false

        if (toStrings(query.ext).some(ext => file.ext === ext)) {
            return true
        }

        if (toStrings(query.name).some(chars => file.name.includes(chars))) {
            return true
        }

        return false
    }
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
    const unknowns: unknown[] = Array.isArray(input) ? input : [input]

    const strings = unknowns.filter((i): i is string => typeof i === 'string')
    return strings
}

function preferSingleValue<T>(input: T[]): undefined | T | T[] {
    return input.length > 1 ? input : input.at(0)
}
