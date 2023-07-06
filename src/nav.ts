import { rm as removeFileOrDir, rename } from 'fs/promises'

import { Stat } from './stat'

import type { File } from './file'
import type { Dir } from './dir'
import { isRelative } from './util'
import { PathSegments } from './path'

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
    file(...pathInput: PathSegments) {
        const { File } = require('./file') as typeof import('./file')
        return new File(this.resolve(...pathInput), this.accessPath)
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
    dir(...pathInput: PathSegments) {
        const { Dir } = require('./dir') as typeof import('./dir')
        return new Dir(this.resolve(...pathInput), this.accessPath)
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

    // TODO figure me out
    // async move(...pathInput: PathInput) {
    //     this.assertInAccessPath(...pathInput)
    //     const targetPath = Nav.isAbsolute(Nav.resolve(...pathInput))
    //         ? Nav.resolve(...pathInput)
    //         : this.resolve(...pathInput)
    //     console.log({ targetPath })
    //     await rename(this.path, targetPath)
    // }

    /**
     * Removes a file or directory.
     */
    async remove(...pathInput: PathSegments) {
        // TODO this method really doesn't fit here.
        this.assertInAccessPath(...pathInput)

        const targetExists = await this.exists(...pathInput)
        if (!targetExists) {
            return false
        }

        const targetPath = this.resolve(...pathInput)
        await removeFileOrDir(targetPath, { recursive: true })

        return true
    }
}
