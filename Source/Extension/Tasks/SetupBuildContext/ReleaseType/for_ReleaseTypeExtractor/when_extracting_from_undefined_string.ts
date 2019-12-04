/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Dolittle. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import {ReleaseTypeExtractor} from '../ReleaseTypeExtractor'
import { expect } from 'chai';

describe('when extracting from undefined string', () => {
    let extractor = new ReleaseTypeExtractor();
    let result = extractor.extract(undefined as any);

    it('should return undefined', () => expect(result).to.be.undefined);
});