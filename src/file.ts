import * as path from 'path'

import { writeFile, readFile, mkdir as makeDir } from 'fs/promises'
import { Nav } from './nav'

//// Main ////

/**
 * Properties and methods for interacting with files on the file system.
 */
class File extends Nav {
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

    override async remove() {
        // overridden to remove relative file removals from this api
        const removed = await super.remove()
        return removed
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
