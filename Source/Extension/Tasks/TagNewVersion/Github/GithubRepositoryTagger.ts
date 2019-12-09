/*---------------------------------------------------------------------------------------------
*  Copyright (c) Dolittle. All rights reserved.
*  Licensed under the MIT License. See LICENSE in the project root for license information.
*--------------------------------------------------------------------------------------------*/
import Octokit from '@octokit/rest';
import { ICanTagRepository } from '../ICanTagRepository';
import { Tag } from '../ITagsCreator';
import { ILogger } from '@dolittle/azure-dev-ops.tasks.shared';

const ref = 'heads/master'
export class GithubRepositoryTagger implements ICanTagRepository {

    private _client: Octokit;

    /**
     * Instantiates an instance of {GithubRepositoryTagger}.
     * @param {ILogger} _logger
     * @param {string} _owner
     * @param {string} _repo
     * @param {string} [_token]
     */
    constructor(private _logger: ILogger, private _owner: string, private _repo: string, private _token?: string) {
        this._client = new Octokit({
            auth: this._token
        });
    }

    async tag(tag: Tag, version: string) {
        this._logger.debug(`Creating tag '${tag}' from version '${version}'`);
        let commitSha = await this._getCommitSha();
        let tagObject = await this._createTagObject(tag, version, commitSha);
        await this._updateReference(tagObject.sha);
        
    }

    private async _getCommitSha() {
        this._logger.debug('Getting commit sha')
        let commitReference = await this._client.git.getRef({
            owner: this._owner,
            repo: this._repo,
            ref
        });
        this._logger.debug(`Status: ${commitReference.status}`);
        return commitReference.data.object.sha;
    }

    private async _createTagObject(tag: string, version: string, commitSha: string) {
        this._logger.debug('Creating tag object');
        let tagResponse = await this._client.git.createTag({
            owner: this._owner,
            repo: this._repo,
            tag,
            object: commitSha,
            message: `Releasing version '${version}'`,
            type: "commit"
        });
        this._logger.debug(`Status: ${tagResponse.status}`);
        return tagResponse.data;
    }

    private async _updateReference(tagSha: string) {
        this._logger.debug('Updating reference');
        let updateResponse = await this._client.git.updateRef({
            owner: this._owner,
            repo: this._repo,
            ref,
            sha: tagSha
        });
        this._logger.debug(`Status: ${updateResponse.status}`);
        return updateResponse;
    }
}
