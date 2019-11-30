/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Dolittle. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import {ReleaseTypeExtractor} from '../ReleaseTypeExtractor'

describe('when extracting from string with only a release type', () => {
    let extractor = new ReleaseTypeExtractor();
    let labels = ['major'];
    let result = extractor.extract(labels, true);

    it('should return major', () => result!.should.be.equal('major'));
});