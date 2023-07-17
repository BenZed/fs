import * as QueryString from 'query-string'
import { type Dir } from './dir'
import { type File } from '../file'
import { Stats } from 'fs'

//// Types ////

type DepthOptions = { recursive?: boolean } | { depth?: number }

/**
 * File search parameters as a serializable
 * alternative to a {@link EachFilter}
 */
type EachOptions = DepthOptions & {
    //
    readonly ext?: string | string[]
    readonly name?: string | string[]
    // readonly contains?: string | string[]
    // readonly size?: number | [number, number] // range
}

type EachQueryString = string

type EachFilter = (input: File | Dir, stats: Stats) => boolean

//// Constants ////

const DEFAULT_ARRAY_FORMAT =
    'comma' satisfies QueryString.ParseOptions['arrayFormat']

//// Main ////

function queryStringToEachOptions(
    queryString: EachQueryString,
    options?: QueryString.ParseOptions
): EachOptions {
    const object = QueryString.parse(queryString, {
        arrayFormat: DEFAULT_ARRAY_FORMAT,
        parseNumbers: true,
        parseBooleans: true,
        ...options
    })

    const { ext, name, /*contains,*/ ...depthOptions } = object

    return {
        ext: toExtOrExts(ext),
        name: toStringOrStrings(name),
        depth: toDepth(depthOptions)
    }
}

function eachOptionsToQueryString(options: EachOptions): string {
    // ignore redundant depth
    if ('depth' in options && options.depth === 1)
        options = { ...options, depth: undefined }

    // convert depth=Infinity to recursive=true
    if ('depth' in options && options.depth === Infinity) {
        options = { ...options, depth: undefined, recursive: true }
    }

    // strip extension dots
    options = {
        ...options,
        ext: toStrings(options.ext).map(ext => ext.replace(/^\./, ''))
    }

    const dirQueryString = QueryString.stringify(options, {
        arrayFormat: DEFAULT_ARRAY_FORMAT
    })

    return '?' + dirQueryString
}

function toEachFilter(
    ...args: (EachOptions | EachFilter | undefined)[]
): EachFilter {
    const filters = args.filter((f): f is EachFilter => typeof f === 'function')

    const options = args.find((o): o is EachOptions => typeof o === 'object')

    if (options && options.ext)
        filters.push(
            f => f.isFile() && toStrings(options.ext).some(ext => f.ext === ext)
        )

    if (options && options.name)
        filters.push(f => toStrings(options.name).some(name => f.name === name))

    return filters.length === 1
        ? filters[0]
        : (i, s) => filters.every(f => f(i, s))
}

//// Helper ////

function toExtOrExts(input: unknown) {
    const exts = toStrings(input)
        // ensure '.' prefix
        .map(str => (str.startsWith('.') ? str : '.' + str))
        // no whitespace
        .filter(str => !/\s/.test(str))

    return preferSingleValue(exts)
}

function toStringOrStrings(input: unknown) {
    const strings = toStrings(input)
    return preferSingleValue(strings)
}

function toStrings(input: unknown): string[] {
    const unknowns: unknown[] = Array.isArray(input) ? input : [input]

    const strings = unknowns.filter((i): i is string => typeof i === 'string')
    return strings
}

function toDepth(...args: (EachOptions | EachFilter | undefined)[]) {
    //
    const options = args.find((o): o is EachOptions => typeof o === 'object')
    if (!options) return 1

    if ('recursive' in options) return options.recursive === true ? Infinity : 1

    if (!('depth' in options)) return 1

    const depth = Number(options.depth)
    if (Number.isNaN(depth)) return 1

    if (depth < 1 || (Number.isFinite(depth) && !Number.isInteger(depth))) {
        throw new Error(`depth must be an integer greater than 0`)
    }

    return depth
}

function preferSingleValue<T>(input: T[]): undefined | T | T[] {
    return input.length > 1 ? input : input.at(0)
}

//// Exports ////

export {
    EachOptions,
    //
    DepthOptions,
    toDepth,
    //
    EachFilter,
    toEachFilter,
    //
    EachQueryString,
    queryStringToEachOptions,
    eachOptionsToQueryString
}
