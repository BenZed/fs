import { isAbsolute, relative, resolve, basename } from 'path'
import { isRelative } from './util'

//// Types ////

export type PathJson = { readonly path: string }

// export type AbsolutePath = `/${string}`

export type PathSegments = string[]

export type PathInput = (PathSegments[number] | PathJson)[]

//// Path ////

/**
 * base class for a file system cursor consisting only of the path state
 * and related method
 */
export class Path implements PathJson {
    static readonly isAbsolute = isAbsolute
    // (...input: PathInput) => input is AbsolutePath

    static readonly isRelative = isRelative

    static resolve(...pathInput: PathInput) {
        //
        const segments: PathSegments = pathInput.map(seg =>
            typeof seg === 'string' ? seg : seg.path
        )

        return resolve(...segments)
    }

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

    /**
     * Resolve a path relative to this location from the input
     */
    relative(...pathInput: PathSegments) {
        return relative(this.path, Path.resolve(...pathInput))
    }

    /**
     * Check if the given path is relative to the current path.
     */
    isRelative(...pathInput: PathSegments): boolean {
        return isRelative(this.path, Path.resolve(...pathInput))
    }

    /**
     * Resolve the given segments against the path.
     */
    resolve(...pathInput: PathSegments) {
        return Path.resolve(this.path, ...pathInput)
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
    toJSON(): PathJson {
        const { path } = this
        return {
            path
        }
    }
}
