import { stat as getStat } from 'fs/promises'
import { Stats } from 'fs'

import { isRelative } from './util'

import { Path, PathInput } from './path'

/**
 * Expanding on Path, the stat class provides information about
 * the file or directory and options for access restriction.
 */
export class Stat extends Path {
    /**
     * path this instance has file-system access to
     */
    readonly accessPath?: string

    constructor(
        path: string,
        /**
         * Optionally restrict access to the given path
         */
        restrict?: boolean
    )

    constructor(
        path: string,

        /**
         * Specific path to restrict file system access to.
         */
        accessPath?: string
    )
    constructor(path: string, accessPath?: boolean | string) {
        super(path)

        this.accessPath =
            typeof accessPath === 'boolean'
                ? accessPath
                    ? path
                    : undefined
                : accessPath
    }

    /**
     * Get the stats of a file or directory.
     * @returns The stats of the file or directory
     */
    async stats(...pathInput: PathInput): Promise<Stats> {
        this.assertInAccessPath(...pathInput)
        const resolvedPath = this.resolve(...pathInput)

        const stats = await getStat(resolvedPath)
        return stats
    }

    /**
     * Check if a file or directory exists.
     * @returns True if the file or directory exists, false otherwise.
     */
    async exists(...pathInput: PathInput) {
        try {
            await this.stats(...pathInput)
            return true
        } catch (e) {
            return !(e as Error).message.includes('no such file or directory')
        }
    }

    /**
     * Returns true if the configured path is accessible based on the accessPath.
     */
    isInAccessPath(...pathInput: PathInput) {
        try {
            this.assertInAccessPath(...pathInput)
            return true
        } catch {
            return false
        }
    }

    /**
     * Asserts if the configured path is accessible based on the accessPath
     */
    assertInAccessPath(...pathInput: PathInput) {
        if (this.accessPath === undefined) return

        const path = this.resolve(...pathInput)

        if (!isRelative(this.accessPath, path))
            throw new Error(`EACCES: permission denied, access '${path}'`)
    }
}
