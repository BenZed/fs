import { extname } from 'path'
import { Dir } from './dir'
import { File } from './file'

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

//// Contextual Convenience Method ////

/**
 * Contextually create a {@link File} or {@link Dir} cursor
 * to a location on the file system, depending on the
 * existence of an extension in the path.
 */
function fs<S extends string>(
    path: S,
    restrict = false
): S extends `${string}.${string}` ? File : Dir {
    const fileOrDir =
        extname(path) === '' ? dir(path, restrict) : file(path, restrict)

    return fileOrDir as S extends `${string}.${string}` ? File : Dir
}

fs.dir = dir

fs.file = file

//// Exports ////

export default fs

export { dir, file }

export * from './dir'

export * from './file'

export * from './util'
