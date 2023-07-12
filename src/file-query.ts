import type { DepthOptions, ReadFilter } from './dir'

//// Types ////

/**
 * File search parameters as a serializable
 * alternative to a {@link ReadFilter}
 */
type FileQuery = DepthOptions & {
    //
    readonly ext?: string | string[]

    readonly name?: string

    // readonly contains: string | string[]
    // readonly size: number
}

//// Main ////

export function toFileQuery(fileQueryString: string): FileQuery {
    throw new Error('not yet implemented')
}

export function fromFileQuery(fileQuery: FileQuery): string {
    throw new Error('not yet implemented')
}

export function createFileQueryFilter(fileQuery: FileQuery): ReadFilter {
    throw new Error('not yet implemented')
}

//// Helper ////
