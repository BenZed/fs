import fs from './index'
import { Dir } from './dir'
import { File } from './file'

import { it, expect, describe } from '@jest/globals'

//// Tests ////

describe(fs.name, () => {
    it(`contextually gets a ${Dir.name} instance if given path does not have an ext`, () => {
        expect(fs('place') satisfies Dir).toBeInstanceOf(Dir)
    })

    it(`contextually gets a ${File.name} instance if given path does have an ext`, () => {
        expect(fs('place.txt') satisfies File).toBeInstanceOf(File)
    })
})
