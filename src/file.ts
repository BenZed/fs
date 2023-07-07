import * as path from 'path'

import { writeFile, readFile, mkdir as makeDir } from 'fs/promises'
import { Nav } from './nav'
import { PathJson, PathSegments } from './path'

//// Types ////

type WriteInput = string[] | [PathJson]

type ReadTransform = (content: string) => unknown

//// Main ////

/**
 * Properties and methods for interacting with files on the file system.
 */
class File extends Nav {
    /**
     * Create a new {@link File} from a given path input
     */
    static from(...pathInput: PathSegments): File {
        return new File(Nav.resolve(...pathInput))
    }

    override get name() {
        return path.basename(this.path, this.ext)
    }

    get ext() {
        return path.extname(this.path)
    }

    //// Read Interface ////

    /**
     * Read the contents of a file
     */
    async read(): Promise<string>

    /**
     * Apply a transform method to the contents of a file
     */
    async read<T extends ReadTransform>(transform: T): Promise<ReturnType<T>>
    async read(transform?: ReadTransform): Promise<unknown> {
        this.assertInAccessPath()

        const content = await readFile(this.path, 'utf-8')
        return transform ? transform(content) : content
    }

    /**
     * Read the contents of a file, split into lines
     **/
    async readLines(delimiter = '\n') {
        return this.read(c => c.split(delimiter))
    }

    // TODO: * eachLine(), * stream()

    //// Write Interface ////

    async write(...input: WriteInput) {
        await writeToFile(this, input, true)
    }

    async append(...input: WriteInput) {
        await writeToFile(this, input, false)
    }

    async copy(file: File) {
        return this.write(file)
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

// TODO: encoding / streams
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
        ? await readFile(input[0].path) // input[0].read() once we have encoding support
        : input.join('\n')

    await writeFile(file.path, content, {
        flag: eraseExistingContent ? 'w' : 'a'
    })
}

//// Exports ////

export { File }
