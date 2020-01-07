/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Dolittle. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Logger, getGithubEndPointToken, getBuildContext, getPullRequestContext, BuildContext } from '@dolittle/azure-dev-ops.tasks.shared';
import * as taskLib from 'azure-pipelines-task-lib';
import path from 'path';
import outputVariables from './OutputVariables';
import { IPipelineContextCreators } from './PipelineContext/IPipelineContextCreators';
import { PipelineContextCreators } from './PipelineContext/PipelineContextCreators';
import { IVersionSorter } from './Version/IVersionSorter';
import { SemVerVersionSorter } from './Version/SemVerVersionSorter';
import { IReleaseTypeExtractor } from './ReleaseType/IReleaseTypeExtractor';
import { ReleaseTypeExtractor } from './ReleaseType/ReleaseTypeExtractor';
import { GithubClient } from './Repository/Github/GithubClient';
import { GithubPipelineContextCreator } from './PipelineContext/Github/GithubPipelineContextCreator';
import { GithubLatestVersionFinder } from './Version/Github/GithubLatestVersionFinder';

taskLib.setResourcePath(path.resolve(__dirname, 'task.json'));

const logger = new Logger();

async function run() {
    try {
        const endpointId = taskLib.getInput('Connection');
        const token = endpointId ? getGithubEndPointToken(endpointId) : undefined;
        const buildContext = getBuildContext();
        const pullRequestContext = getPullRequestContext();
        const versionSorter: IVersionSorter = new SemVerVersionSorter(logger);
        const releaseTypeExtractor: IReleaseTypeExtractor = new ReleaseTypeExtractor(logger);

        const githubClient = createGithubClient(versionSorter, buildContext, token);
        const githubLatestVersionFinder = createGithubLatestVersionFinder(githubClient);
        const pipelineContextCreators = getPipelineContextCreators(releaseTypeExtractor, githubClient, githubLatestVersionFinder);

        const pipelineContext = await pipelineContextCreators.create(buildContext, pullRequestContext);

        taskLib.setVariable(outputVariables.PreviousVersion, pipelineContext.previousVersion);
        taskLib.setVariable(outputVariables.ShouldPublish, `${pipelineContext.shouldPublish}`);
        if (pipelineContext.releaseType !== undefined) taskLib.setVariable(outputVariables.ReleaseType, pipelineContext.releaseType!);
        taskLib.setResult(taskLib.TaskResult.Succeeded, 'Success');
    }
    catch (err) {
        taskLib.setResult(taskLib.TaskResult.Failed, err.message);
    }
}

function createGithubClient(versionSorter: IVersionSorter, buildContext: BuildContext, token?: string) {
    return new GithubClient(logger, versionSorter, buildContext, token);
}

function createGithubLatestVersionFinder(client: GithubClient) {
    return new GithubLatestVersionFinder(client, logger);
}

function getPipelineContextCreators(releaseTypeExtractor: IReleaseTypeExtractor, githubClient: GithubClient, githubLatestVersionFinder: GithubLatestVersionFinder) {
    const pipelineContextCreators: IPipelineContextCreators = new PipelineContextCreators([
        new GithubPipelineContextCreator(githubClient, releaseTypeExtractor, githubLatestVersionFinder, logger)
    ]);

    return pipelineContextCreators;
}

run();
