/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Dolittle. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Logger } from '@dolittle/azure-dev-ops.tasks.shared';
import * as taskLib from 'azure-pipelines-task-lib';
import path from 'path';
import { ReleaseType } from 'semver';
import { VersionIncrementor } from './VersionIncrementor';

taskLib.setResourcePath(path.resolve(__dirname, 'task.json'));
const logger = new Logger();
async function run() {
    try {
        const versionIncrementor = new VersionIncrementor(logger);

        const previousVersion = taskLib.getInput('PreviousVersion', true)!;
        let releaseType = taskLib.getInput('ReleaseType') as string | undefined;
        if (releaseType && releaseType.startsWith('$(')) releaseType = undefined;
        if (releaseType === undefined) {
            logger.log('Got undefined ReleaseType. Outputting PreviousVersion as NextVersion');

            taskLib.setVariable('NextVersion', previousVersion);
            taskLib.setResult(taskLib.TaskResult.Succeeded, 'No release type triggering new version');
        }
        else {

            logger.log(`Calculating new version from previous version '${previousVersion}' using release type '${releaseType}'`);

            taskLib.debug(`Got Previous Version ${previousVersion}`);
            taskLib.debug(`Got Release Type: ${releaseType}`);

            taskLib.debug(`Updating version for new ${releaseType}`);
            const newVersion = versionIncrementor.increment(previousVersion, releaseType as ReleaseType);

            logger.log(`Setting next version to be '${newVersion}'`);
            taskLib.setVariable('NextVersion', newVersion);
            taskLib.setResult(taskLib.TaskResult.Succeeded, `Successfully updated version from '${previousVersion}' to ${newVersion}`);
        }
    }
    catch (err) {
        taskLib.setResult(taskLib.TaskResult.Failed, err.message);
    }
}

run();
