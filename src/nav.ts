import { rm as removeFileOrDir } from 'fs/promises'

import { Stat } from './stat'

import type { File } from './file'
import type { Dir } from './dir'
import { isRelative } from './util'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-var-requires,
*/

/**
 * Interface elements that are in both File and Dir
 */
export class Nav extends Stat {
    /**
     * Navigate to a relative File
     */
    file(...relPath: string[]) {
        const { File } = require('./file') as typeof import('./file')
        return new File(this.resolve(...relPath), this.accessPath)
    }

    isFile(): this is File {
        return (
            'write' in this &&
            'read' in this &&
            'append' in this &&
            'erase' in this
        )
    }

    /**
     * Navigate to a relative Dir
     */
    dir(...relPath: string[]) {
        const { Dir } = require('./dir') as typeof import('./dir')
        return new Dir(this.resolve(...relPath), this.accessPath)
    }

    isDir(): this is Dir {
        return !this.isFile()
    }

    /**
     * Navigate to the parent dir
     */
    get parent() {
        return this.dir('../')
    }

    *eachParent() {
        let { parent: dir } = this

        while (dir.parent.path !== dir.path) {
            yield dir
            dir = dir.parent

            if (
                this.accessPath !== undefined &&
                !isRelative(this.accessPath, dir.path)
            )
                break
        }
    }

    /**
     * Removes a file or directory.
     */
    async remove(...relPath: string[]) {
        // TODO this method really doesn't fit here.
        this.assertInAccessPath(...relPath)

        const targetExists = await this.exists(...relPath)
        if (!targetExists) {
            return false
        }

        const targetPath = this.resolve(...relPath)
        await removeFileOrDir(targetPath, { recursive: true })

        return true
    }
}
