import {
    beforeAll,
    beforeEach,
    afterAll,
    test,
    expect,
    describe
} from '@jest/globals'

import * as TEST_DIR from './test-dir.util.test'

import { File } from './file'

//// Setup ////

let joke: File
let jokeNoAccess: File
beforeAll(() => {
    joke = new File(TEST_DIR.resolve('joke.txt'))
    jokeNoAccess = new File(
        TEST_DIR.resolve('joke.txt'),
        TEST_DIR.resolve('some/where/else')
    )
})

beforeEach(TEST_DIR.reset)
afterAll(TEST_DIR.erase)

//// Tests ////

describe(`new ${File.name}`, () => {
    test(`sets ${'path' satisfies keyof File}`, () => {
        expect(joke.path).toEqual(TEST_DIR.resolve('joke.txt'))
    })

    test('name' satisfies keyof File, () => {
        expect(joke.name).toEqual('joke')
    })

    test('ext' satisfies keyof File, () => {
        expect(joke.ext).toEqual('.txt')
    })
})

const { read } = File.prototype
describe(read.name, () => {
    test('gets content from a file', async () => {
        await expect(joke.read()).resolves.toEqual(
            await TEST_DIR.readFile('joke.txt')
        )
    })

    test(`respects ${'accessPath' satisfies keyof File} property`, async () => {
        await expect(
            jokeNoAccess.write('I have erased this joke!')
        ).rejects.toThrow('permission denied')
    })

    test('optional transform argument', async () => {
        const lines = await joke.read(c => c.split('\n'))
        expect(lines).toEqual(await joke.read().then(c => c.split('\n')))
    })
})

const { readLines } = File.prototype
describe(readLines.name, () => {
    test('gets content from a file as lines', async () => {
        await expect(joke.readLines()).resolves.toEqual(
            await TEST_DIR.readFile('joke.txt').then(c => c.split('\n'))
        )
    })

    test('optional delimiter argument', async () => {
        await expect(joke.readLines('prefer')).resolves.toEqual(
            await TEST_DIR.readFile('joke.txt').then(c => c.split('prefer'))
        )
    })
})

const { write } = File.prototype
describe(write.name, () => {
    test(`replace file content`, async () => {
        const newJoke = [
            'What did the chicken say when he crossed the road?',
            "Chickens don't talk."
        ]

        const contentBeforeWrite = await joke.read()
        expect(contentBeforeWrite).not.toEqual(newJoke.join('\n'))

        await joke.write(...newJoke)

        const contentAfterWrite = await joke.read()
        expect(contentAfterWrite).toEqual(newJoke.join('\n'))
    })

    test(`creates missing directories`, async () => {
        const story = new File(TEST_DIR.resolve('stories/short-story.txt'))

        expect(await story.exists()).toEqual(false)
        const storyLines = [
            'I went to the store.',
            'I bought an apple.',
            'I ate the apple.'
        ]
        await story.write(...storyLines)
        expect(await story.read()).toContain(storyLines.join('\n'))
    })

    test(`can take a file as input`, async () => {
        const jokeCopy = joke.file('../joke-copy.txt')

        await jokeCopy.write(joke)

        expect(await jokeCopy.read()).toEqual(await joke.read())
    })

    test(`respects ${'accessPath' satisfies keyof File} property`, async () => {
        await expect(
            jokeNoAccess.write('I have erased this joke!')
        ).rejects.toThrow('permission denied')
    })
})

const { erase } = File.prototype
describe(erase.name, () => {
    test("alias to write('')", async () => {
        const contentBeforeErase = await joke.read()
        expect(contentBeforeErase).not.toHaveLength(0)

        await joke.erase()

        const contentAfterErase = await joke.read()
        expect(contentAfterErase).toHaveLength(0)
    })
})

const { append } = File.prototype
describe(append.name, () => {
    test(`append file content`, async () => {
        const note = 'This is not funny.'

        const contentBeforeWrite = await joke.read()
        expect(contentBeforeWrite).not.toContain(note)

        await joke.append(note)

        const contentAfterWrite = await joke.read()
        expect(contentAfterWrite).toContain(contentBeforeWrite)
        expect(contentAfterWrite).toContain(note)
    })

    test(`creates missing directories`, async () => {
        const story = new File(TEST_DIR.resolve('stories/short-story.txt'))

        expect(await story.exists()).toEqual(false)
        const storyLines = [
            'I went to the store.',
            'I bought an apple.',
            'I ate the apple.'
        ]
        await story.append(...storyLines)
        expect(await story.read()).toContain(storyLines.join('\n'))
    })

    test(`respects ${'accessPath' satisfies keyof File} property`, async () => {
        await expect(
            jokeNoAccess.append('I have added to this joke!')
        ).rejects.toThrow('permission denied')
    })
})

const { remove } = File.prototype
describe(remove.name, () => {
    test(`delete file`, async () => {
        await joke.remove()
        await expect(TEST_DIR.fileExists('joke.txt')).resolves.toBe(false)
    })

    test(`returns true if deletion ocurred`, async () => {
        const removeOcurred = await joke.remove()
        expect(removeOcurred).toBe(true)
    })

    test(`returns false if no deletion ocurred`, async () => {
        const ocurredFirstTime = await joke.remove()
        expect(ocurredFirstTime).toBe(true)

        const didNotOccurSecondTime = await joke.remove()
        expect(didNotOccurSecondTime).toBe(false)
    })

    test(`respects ${'accessPath' satisfies keyof File} property`, async () => {
        await expect(jokeNoAccess.remove()).rejects.toThrow('permission denied')
    })
})

test(`${File.name}.${File.from.name}`, () => {
    expect(File.from('a', 'b', 'c.txt')).toEqual(new File('a/b/c.txt'))
})
