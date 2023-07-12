import { extname } from 'path'
import { Dir } from './dir'
import { File } from './file'

//// Contextual Convenience Method ////

type Fs<S extends string> = string extends S
    ? File | Dir // S is not static, so we're not sure
    : S extends `${string}.${string}`
    ? File // S has an extension, so we're assuming it is a File
    : Dir // S doesn't have an extension, we're assuming it's a Dir

/**
 * Contextually create a {@link File} or {@link Dir} cursor
 * to a location on the file system, depending on the
 * existence of an extension in the path.
 */
function fs<S extends string>(path: S, restrict = false): Fs<S> {
    const fileOrDir =
        extname(path) === '' ? dir(path, restrict) : file(path, restrict)

    return fileOrDir as Fs<S>
}

fs.dir = dir

fs.file = file

//// Convenience Methods ////

/**
 * Create a {@link Dir} cursor to a location on the file system.
 */
function dir(path: string, restrict = false) {
    return new Dir(path, restrict)
}

/**
 * Create a {@link File} cursor to a location on the file system.
 */
function file(path: string, restrict = false) {
    return new File(path, restrict)
}

//// Exports ////

export default fs

export * from './dir'

export * from './file'
