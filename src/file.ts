import * as path from 'path'

import { writeFile, readFile, mkdir as makeDir } from 'fs/promises'
import { Nav } from './nav'
import { PathInput } from './path'

//// Types ////

type WriteInput = string[] | [File]

//// Main ////

/**
 * Properties and methods for interacting with files on the file system.
 */
class File extends Nav {
    /**
     * Create a new {@link File} from a given path input
     */
    static from(...pathInput: PathInput): File {
        return new File(Nav.resolve(...pathInput))
    }

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

    async write(...input: WriteInput) {
        await writeToFile(this, input, true)
    }

    async append(...input: WriteInput) {
        await writeToFile(this, input, false)
    }

    async erase() {
        await writeToFile(this, [], true)
    }

    override async remove() {
        // overridden to remove relative file removals from this api
        const removed = await super.remove()
        return removed
    }
}

//// Helper ////

function isFileInput(input: WriteInput): input is [File] {
    return input[0] instanceof File
}

async function writeToFile(
    file: File,
    input: WriteInput,
    eraseExistingContent: boolean
) {
    file.assertInAccessPath()

    // Ensure path exists
    if (!(await file.exists())) {
        await makeDir(path.dirname(file.path), { recursive: true })
    }

    const content = isFileInput(input)
        ? await input[0].read()
        : input.join('\n')

    await writeFile(file.path, content, {
        flag: eraseExistingContent ? 'w' : 'a'
    })
}

//// Exports ////

export { File }
