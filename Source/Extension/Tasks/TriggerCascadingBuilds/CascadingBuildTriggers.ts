/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Dolittle. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ICanTriggerCascadingBuild } from './ICanTriggerCascadingBuild';
import { ICascadingBuildTriggers } from './ICascadingBuildTriggers';
import { ICascadingBuildMessageCreator } from './ICascadingBuildMessageCreator';
import { TriggerContext } from './TriggerContext';

/**
 * Represents an implementation of {ICascadingBuildTriggers}
 *
 * @export
 * @class CascadingBuildTriggers
 * @implements {ICascadingBuildTriggers}
 */
export class CascadingBuildTriggers implements ICascadingBuildTriggers {

    /**
     * Instantiates an instance of {CascadingBuildTriggers}.
     * @param {ICanTriggerCascadingBuild[]} [_triggers=[]]
     */
    constructor(private _messageCreator: ICascadingBuildMessageCreator, private _triggers: ICanTriggerCascadingBuild[] = []) {}

    async trigger(triggerContext: TriggerContext, cascades: string[], version: string, token?: string) {
        const triggers = this._triggers.filter(_ => _.canTrigger(triggerContext));
        if (triggers.length === 0) throw new Error(`There are no trigger that can trigger build from context: ${triggerContext}`);
        if (triggers.length > 1) throw new Error(`There are multiple triggerers that can trigger build from context: ${triggerContext}`);
        const trigger = triggers[0];
        const triggerMessage = this._messageCreator.create(triggerContext.repository, version);
        await Promise.all(cascades.map(_ => trigger.trigger(triggerMessage, _, token)));
    }

}
