import { Stats } from 'fs'
import { readdir } from 'fs/promises'

import { Nav } from '../nav'
import { PathSegments } from '../path'

import { EachFilter, EachOptions, toDepth, toEachFilter } from './each-options'
import { EachItem } from './each-item'
import { File } from '../file'

//// Types ////

export type FileFilter = (input: File, stats: Stats) => boolean

export type DirFilter = (input: Dir, stats: Stats) => boolean

//// Class ////

/**
 * Properties and methods for interacting with files on the file system.
 */
export class Dir extends Nav {
    /**
     * Create a new {@link Dir} from a given path input
     */
    static from(...pathInput: PathSegments): Dir {
        return new Dir(Nav.resolve(...pathInput))
    }

    /**
     * Read the names of all contained contents
     */
    read(option?: { recursive?: boolean }): Promise<string[]> {
        return readdir(this.path, option)
    }

    /**
     * Get an Array of contained {@link Dir}s
     */
    dirs(options?: EachOptions): Promise<Dir[]>
    dirs(options: EachOptions, filter?: DirFilter): Promise<Dir[]>
    dirs(filter?: DirFilter): Promise<Dir[]>
    dirs(...args: (EachOptions | DirFilter | undefined)[]) {
        return this.each(
            ...(args as EachOptions[]),
            //
            (f: File | Dir, stat: Stats): f is Dir => stat.isDirectory()
        ).toArray()
    }

    /**
     * Get an Array of contained {@link Files}s
     */
    files(options?: EachOptions): Promise<File[]>
    files(options: EachOptions, filter?: FileFilter): Promise<File[]>
    files(filter?: FileFilter): Promise<File[]>
    files(...args: (EachOptions | FileFilter | undefined)[]) {
        return this.each(
            ...(args as EachOptions[]),
            //
            (f: File | Dir, stat: Stats): f is File => stat.isFile()
        ).toArray()
    }

    /**
     * Iterate through each contained {@link File} or {@link Dir}
     */
    each(options?: EachOptions): EachItem<EachFilter>
    each<T extends EachFilter>(
        options: EachOptions,
        filter?: EachFilter
    ): EachItem<T>
    each<T extends EachFilter>(filter: T): EachItem<T>

    each(
        ...args: (EachOptions | EachFilter | undefined)[]
    ): EachItem<EachFilter> {
        //
        this.assertInAccessPath()

        //
        const depth = toDepth(...args)
        const filter = toEachFilter(...args)

        return new EachItem(this, depth, filter)
    }
}
