import fs from 'fs/promises'
import { Stats } from 'fs'

import { Path } from './path'
import { isRelative } from './util'

/**
 * Expanding on Path, the stat class provides information about
 * the file or directory and options for access restriction.
 */
export class Stat extends Path {
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
         * The specific path to restrict access to.
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
     * @param relPath - Optional relative path of the file or directory.
     * @returns The stats of the file or directory
     */
    async stat(relPath?: string): Promise<Stats> {
        this.assertAccessible(relPath)
        const resolvedPath = this.resolve(relPath ?? '')

        const stats = await fs.stat(resolvedPath)
        return stats
    }

    /**
     * Check if a file or directory exists.
     * @param relPath - Optional relative path of the file or directory.
     * @returns True if the file or directory exists, false otherwise.
     */
    async exists(relPath?: string) {
        try {
            await this.stat(relPath)
            return true
        } catch (e) {
            return !(e as Error).message.includes('no such file or directory')
        }
    }

    /**
     * Returns true if the configured path is a file.
     *
     * @param relPath - Relative path to check
     */
    async isFile(relPath?: string) {
        const stat = await this.stat(relPath).catch(() => null)
        return !!stat?.isFile()
    }

    /**
     * Returns true if the configured path is a directory.
     *
     * @param relPath - Relative path to check
     */
    async isDirectory(relPath?: string) {
        const stat = await this.stat(relPath).catch(() => null)
        return !!stat?.isDirectory()
    }

    /**
     * Returns true if the configured path is accessible based on the accessPath.
     *
     * @param relPath - The relative path to test accessibility for.
     */
    isAccessible(relPath?: string) {
        try {
            this.assertAccessible(relPath)
            return true
        } catch {
            return false
        }
    }

    /**
     * Asserts if the configured path is accessible based on the accessPath
     *
     * @param relPath - The relative path to test accessibility for.
     */
    assertAccessible(relPath?: string) {
        if (this.accessPath === undefined) return

        const path = this.resolve(relPath ?? '')

        if (!isRelative(this.accessPath, path))
            throw new Error(`EACCES: permission denied, access '${path}'`)
    }
}
