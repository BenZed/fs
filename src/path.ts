import { isAbsolute, relative, resolve, basename } from 'path'
import { isRelative } from './util'

/**
 * base class for a file system cursor consisting only of the path state
 * and related method
 */
export class Path {
    //// Construct ////

    readonly path: string
    constructor(path: string) {
        if (!isAbsolute(path)) {
            path = resolve(process.cwd(), path)
        }

        this.path = path
    }

    //// Path Interface ////

    /**
     * Get the name of the file or directory.
     */
    get name() {
        return basename(this.path)
    }

    relative(...pathSegments: string[]) {
        return relative(this.path, resolve(...pathSegments))
    }

    /**
     * Check if the given path is relative to the current path.
     * @param targetPath - The path to check.
     * @returns True if the path is relative, false otherwise.
     */
    isRelative(...pathSegments: string[]): boolean {
        return isRelative(this.path, resolve(...pathSegments))
    }

    /**
     * Resolve the given segments against the path.
     * @param pathSegments - The segments to resolve.
     * @returns The resolved path.
     */
    resolve(...pathSegments: string[]) {
        return resolve(this.path, ...pathSegments)
    }

    //// Builtins ////

    /**
     * Get the string representation of the path.
     */
    toString() {
        return this.path
    }

    /**
     * Get the JSON representation of the path.
     */
    toJSON() {
        const { path } = this
        return {
            path
        }
    }
}
