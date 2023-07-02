import * as path from 'path'

//// Main ////

/**
 * Determines whether a source path is relative to a target path.
 *
 * @param sourcePath The source path.
 * @param targetPath The target path.
 * @returns `true` if the source path is relative to the target path, `false` otherwise.
 */
function isRelative(sourcePath: string, targetPath: string): boolean {
    const relPath = path.relative(
        path.resolve(sourcePath),
        path.resolve(targetPath)
    )

    return !relPath.startsWith('..') && !path.isAbsolute(relPath)
}

//// Exports ////

export { isRelative }
