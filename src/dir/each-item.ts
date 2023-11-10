import fs from 'fs/promises'
import { Stats } from 'fs'

import { File } from '../file'
import { EachFilter } from './each-options'
import { Dir } from './dir'

//// Helper Types ////

type EachGuard<T extends Dir | File> = (
    input: Dir | File,
    stats: Stats
) => input is T

//// Types ////

export type EachFilterOutput<T extends EachFilter> = T extends EachGuard<
    infer Tx
>
    ? Tx
    : Dir | File

//// EachItem Async Iterator ////

export class EachItem<F extends EachFilter>
    implements AsyncIterable<EachFilterOutput<F>>
{
    constructor(
        readonly dir: Dir,
        readonly depth: number,
        readonly filter: F
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<EachFilterOutput<F>> {
        for (const name of await fs.readdir(this.dir.path)) {
            //
            const stat = await this.dir.stats(name).catch(e => void e)
            if (!stat) continue // access or compat error

            const item = stat.isFile()
                ? this.dir.file(name)
                : this.dir.dir(name)

            if (this.filter(item, stat)) {
                yield item as EachFilterOutput<F>
            }

            if (item.isDir() && this.depth > 1) {
                yield* new EachItem<F>(item, this.depth - 1, this.filter)
            }
        }
    }

    async toArray(): Promise<EachFilterOutput<F>[]> {
        //
        const items: EachFilterOutput<F>[] = []
        for await (const item of this) {
            items.push(item)
        }

        return items
    }
}
