import fs from 'fs/promises'

import { Nav } from './nav'
import { File } from './file'

//// Types ////

type ReadOptions = { recursive: boolean } | { depth: number }
// type FileFilter = (file: File) => boolean
// type DirFilter = (dir: Dir) => boolean

//// Class ////

/**
 * Properties and methods for interacting with files on the file system.
 */
export class Dir extends Nav {
    /**
     * Get a list of {@link File} or {@link Dir}
     */
    async read(options?: ReadOptions) {
        const children: (File | Dir)[] = []
        for await (const child of this.each(options)) {
            children.push(child)
        }

        return children
    }

    /**
     * Get a list of contained {@link File}
     */
    async files(options?: ReadOptions) {
        const contents = await this.read(options)
        return contents.filter((content): content is File => content.isFile())
    }

    /**
     * Get a list of contained {@link Dir}
     */
    async dirs(options?: ReadOptions) {
        const contents = await this.read(options)
        return contents.filter((content): content is Dir => content.isDir())
    }

    /**
     * Iterate through each {@link File} or {@link Dir} contained within.
     */
    async *each(
        options: ReadOptions = { depth: 1 }
    ): AsyncIterable<File | Dir> {
        //
        const depth =
            'recursive' in options
                ? options.recursive
                    ? Infinity
                    : 1
                : options.depth

        if (
            depth <= 0 ||
            (Number.isFinite(depth) && !Number.isInteger(depth))
        ) {
            throw new Error(`depth must be an integer greater than 0`)
        }

        this.assertInAccessPath()
        //

        for (const name of await fs.readdir(this.path)) {
            const stat = await this.stats(name)

            const child = stat.isFile() ? this.file(name) : this.dir(name)

            yield child
            if (child.isDir() && depth > 1) {
                yield* child.each({ depth: depth - 1 })
            }
        }
    }
}
