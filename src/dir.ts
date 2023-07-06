import fs from 'fs/promises'
import { Stats } from 'fs'

import { Nav } from './nav'
import { File } from './file'
import { PathInput } from './path'

//// Types ////

type DepthOptions = { recursive?: boolean } | { depth?: number }

type ReadFilter = (input: File | Dir, stats: Stats) => boolean

type ReadGuard<T extends Dir | File> = (
    input: Dir | File,
    stats: Stats
) => input is T

type ReadOptions =
    | DepthOptions
    | ReadFilter
    | (DepthOptions & { filter?: ReadFilter })

type ReadOptionsOutput<T extends ReadOptions> = T extends ReadGuard<infer Tx>
    ? Tx
    : T extends { filter: ReadGuard<infer Tx> }
    ? Tx
    : Dir | File

//// Class ////

/**
 * Properties and methods for interacting with files on the file system.
 */
export class Dir extends Nav {
    /**
     * Create a new {@link Dir} from a given path input
     */
    static from(...pathInput: PathInput): Dir {
        return new Dir(Nav.resolve(...pathInput))
    }

    /**
     * Get a list of contained {@link File} or {@link Dir}
     */
    async read<T extends ReadOptions>(
        options: T
    ): Promise<ReadOptionsOutput<T>[]>

    /**
     * Get a list of contained {@link File} or {@link Dir}
     */
    async read(options?: ReadOptions): Promise<(File | Dir)[]>

    /**
     * Get a list of contained {@link File} or {@link Dir}
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
    async files(options?: DepthOptions): Promise<File[]> {
        const items = await this.read({
            ...options,
            filter(item): item is File {
                return item.isFile()
            }
        })
        return items
    }

    /**
     * Get a list of contained {@link Dir}
     */
    async dirs(options?: DepthOptions) {
        const items = await this.read({
            ...options,
            filter(item): item is Dir {
                return item.isDir()
            }
        })
        return items
    }

    /**
     * Iterate through each {@link File} or {@link Dir} contained within.
     */
    each<T extends ReadOptions>(options: T): AsyncIterable<ReadOptionsOutput<T>>

    /**
     * Iterate through each {@link File} or {@link Dir} contained within.
     */
    each(options?: ReadOptions): AsyncIterable<File | Dir>

    async *each(
        options: ReadOptions = { depth: 1 }
    ): AsyncIterable<File | Dir> {
        //
        const depth =
            'recursive' in options
                ? options.recursive
                    ? Infinity
                    : 1
                : 'depth' in options && options.depth !== undefined
                ? options.depth
                : 1

        const filter =
            typeof options === 'function'
                ? options
                : 'filter' in options && !!options.filter
                ? options.filter
                : () => true

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

            if (filter(child, stat)) {
                yield child
            }

            if (child.isDir() && depth > 1) {
                yield* child.each({ depth: depth - 1, filter })
            }
        }
    }
}
