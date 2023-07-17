import { isAbsolute, relative, resolve, basename, sep } from 'path'
import { isRelative } from './util'

//// Types ////

export type PathJson = { readonly path: string }

export type AbsolutePath = `/${string}`

export type RelativePath = string

export type PathSegments = RelativePath[]

export type PathInput = PathSegments | [PathJson]

export type PathResolveInput = (PathSegments[number] | PathJson)[]

//// Path ////

/**
 * base class for a file system cursor consisting only of the path state
 * and related method
 */
export class Path implements PathJson {
    /**
     * Platform specific file separator
     */
    static readonly SEPARATOR = sep

    static isAbsolute(path: RelativePath | AbsolutePath): path is AbsolutePath
    static isAbsolute(...pathInput: PathResolveInput): boolean
    static isAbsolute(...pathInput: PathResolveInput) {
        const segments = this._toSegments(...pathInput)
        return segments.some(isAbsolute)
    }

    static isRelative(from: string | PathJson, to: string | PathJson) {
        const [fromStr, toStr] = this._toSegments(from, to)

        return isRelative(fromStr, toStr)
    }

    static resolve(...pathInput: PathResolveInput) {
        return resolve(...this._toSegments(...pathInput))
    }

    private static _toSegments(...pathInput: PathResolveInput) {
        const segments: PathSegments = pathInput.map(seg =>
            typeof seg === 'string' ? seg : seg.path
        )
        return segments
    }

    //// Construct ////

    readonly path: AbsolutePath
    constructor(path: RelativePath | AbsolutePath) {
        if (!isAbsolute(path)) {
            path = resolve(process.cwd(), path)
        }

        this.path = path as AbsolutePath
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
    relative(...pathInput: PathInput) {
        return relative(this.path, Path.resolve(...pathInput))
    }

    /**
     * Check if the given path is relative to the current path.
     */
    isRelative(...pathInput: PathInput): boolean {
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
