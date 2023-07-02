import { Stat } from './stat'

import * as path from 'path'

import {
    writeFile,
    readFile,
    mkdir as makeDir,
    rm as removeFileOrDir
} from 'fs/promises'

//// Main ////

/**
 * Expanding on stat, the File class has properties and methods
 * for interacting with files on the file system.
 */
class File extends Stat {
    override get name() {
        return path.basename(this.path, this.ext)
    }

    get ext() {
        return path.extname(this.path)
    }

    //// Read Interface ////

    async read() {
        this.assertInAccessPath()

        const content = await readFile(this.path, 'utf-8')
        return content
    }

    async write(...lines: string[]) {
        await writeLines(this, lines, true)
    }

    async append(...lines: string[]) {
        await writeLines(this, lines, false)
    }

    async erase() {
        await writeLines(this, [], true)
    }

    async remove() {
        this.assertInAccessPath()

        const targetExists = await this.exists()
        if (!targetExists) {
            return false
        }

        await removeFileOrDir(this.path)

        return true
    }
}

//// Helper ////

async function writeLines(
    file: File,
    lines: string[],
    eraseExistingContent: boolean
) {
    file.assertInAccessPath()

    if (!(await file.exists())) {
        await makeDir(path.dirname(file.path), { recursive: true })
    }

    await writeFile(file.path, lines.join('\n'), {
        flag: eraseExistingContent ? 'w' : 'a'
    })
}

//// Exports ////

export { File }
