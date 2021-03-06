/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Dolittle. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { getGithubEndPointToken, Logger } from '@dolittle/azure-dev-ops.tasks.shared';
import * as taskLib from 'azure-pipelines-task-lib';
import path from 'path';
import { TagsCreator } from './TagsCreator';
import { GithubRepositoryTagger } from './Github/GithubRepositoryTagger';
import InputVariables from './InputVariables';

taskLib.setResourcePath(path.resolve(__dirname, 'task.json'));

const logger = new Logger();
async function run() {
    try {
        const endpointId = taskLib.getInput(InputVariables.Connection, true)!;
        const repository = taskLib.getInput(InputVariables.Repository, true)!;
        const token = getGithubEndPointToken(endpointId);
        const version = taskLib.getInput('Version', true)!;
        const tagsCreator = new TagsCreator(logger);

        const [owner, repo] = repository.split('/', 2);
        const githubTagger = new GithubRepositoryTagger(logger, owner, repo, token);
        const tags = tagsCreator.create(version);

        for (const tag of tags) {
            await githubTagger.tag(tag, version);
        }

        taskLib.setResult(taskLib.TaskResult.Succeeded, 'Success');
    }
    catch (err) {
        taskLib.setResult(taskLib.TaskResult.Failed, err.message);
    }
}

run();
