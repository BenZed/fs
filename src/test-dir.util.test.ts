import fs from 'fs/promises'
import p from 'path'
import { AbsolutePath } from './path'

//// Test Utilities ////

// The exports in this file are utility methods to assist with testing.
// They should not be included in the package compilation or module exports, and
// this module should not be referenced in documentation.

//// Helper ////

const ignoreError = (e: Error) => void e

//// Exports ////

/**
 * Path of the directory being used for testing
 */
export const path = p.resolve(__dirname, 'test-dir')

/**
 * Resolve a path relative to the {@link path} dir
 */
export const resolve = (relPath: string): AbsolutePath =>
    p.resolve(path, relPath) as AbsolutePath

/**
 * Delete the {@link path} dir and everything in it
 */
export const erase = () => fs.rm(path, { recursive: true }).catch(ignoreError)

/**
 * Write content to a file relative to the {@link path} dir
 */
export const writeFile = async (relPath: string, lines: string[]) => {
    const filePath = resolve(relPath)

    const dirPath = p.dirname(filePath)

    await fs
        .mkdir(dirPath, {
            recursive: true
        })
        .catch(ignoreError)

    await fs.writeFile(filePath, lines)
}

/**
 * Read a file in a path relative to {@link path} dir directory
 */
export const readFile = (relPath: string) =>
    fs.readFile(resolve(relPath), 'utf-8')

/**
 * Does a given file relative to the {@link path} dir exist?
 */
export const fileExists = (relPath: string) =>
    fs
        .stat(resolve(relPath))
        .then(() => true)
        .catch(() => false)

/**
 * Empty the {@link path} dir and fill it with with jokes,
 * poems and riddles for testing purposes.
 */
export const reset = async () => {
    //
    await erase()

    await writeFile('readme.md', [
        '# Generated Files For Testing',
        '',
        'This folder contains files that are generated during testing.'
    ])

    await writeFile('joke.txt', [
        'Why do programmers prefer dark mode?',
        'Because light attracts bugs!'
    ])

    await writeFile('riddle.txt', [
        'I am a language, both old and new,',
        'With syntax rules you must pursue.',
        "I'm compiled or interpreted, it's your choice,",
        'And with me, you can make apps rejoice.',
        'What am I? Can you construe?',
        '',
        'I am the programming language, JavaScript!'
    ])

    await writeFile('poems/haiku.txt', [
        `Code is poetry,`,
        `Bugs are its hidden verses,`,
        `Laughter through debug.`
    ])

    await writeFile('poems/sonnet.txt', [
        'In lines of code, a world of logic lies,',
        'Where programmers seek their mastery,',
        'With keystrokes swift, their creations rise,',
        'In elegant syntax and efficiency.',
        '',
        'Their minds, like compilers, parse through the haze,',
        'Debugging errors, squashing every bug,',
        'With care and skill, they craft their work ablaze,',
        'To build solutions, robust and snug.',
        '',
        'But programming, at times, can be a fight,',
        'When deadlines loom and challenges arise,',
        'Yet programmers press on, their will ignite,',
        'They persevere with passion in their eyes.',
        '',
        "So let us sing the programmer's refrain,",
        "Of bytes and algorithms, the artist's domain."
    ])

    await writeFile('poems/limerick.txt', [
        'There once was a programmer keen,',
        'Whose code was the cleanest ever seen,',
        'With functions and classes,',
        'No bugs in their passes,',
        'Their work was a true coding dream.'
    ])

    await writeFile('poems/wip/nursery-rhyme.txt', [
        'Roses are #FF0000,',
        'Violets are #0000FF,',
        'My code is a mess,',
        "But I won't be blue."
    ])

    await writeFile('poems/readme.md', [
        '# Generated Poems',
        '',
        'This folder contains poems generated during testing.'
    ])
}
