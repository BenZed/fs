import { isAbsolute, relative, resolve, basename } from 'path'
import { isRelative } from './util'

//// Types ////

type PathJson = { readonly path: string }
type PathInput = string[]

//// Path ////

/**
 * base class for a file system cursor consisting only of the path state
 * and related method
 */
export class Path implements PathJson {
    static resolve(...pathInput: PathInput) {
        const segments = pathInput.map(seg => seg)

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
    resolve(...pathInput: PathInput) {
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
