import { Actions } from '@benzed/dev'

/**
 * This dev action is for running standard actions exported by the {@link @benzed/dev} package.
 */

export default Actions.createPipe(
    // So far, just the test runner.
    Actions.runTests

    // TODO:
    //
    // Actions.autoPublish
    // Actions.syncDependencies
)
