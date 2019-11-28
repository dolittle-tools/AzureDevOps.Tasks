/*---------------------------------------------------------------------------------------------
*  Copyright (c) Dolittle. All rights reserved.
*  Licensed under the MIT License. See LICENSE in the project root for license information.
*--------------------------------------------------------------------------------------------*/
import { VersionIncrementor } from "../../VersionIncrementor";

describe('and version has major', () => {
    let version_incrementor = new VersionIncrementor();
    let version = '1.0.0';
    let result = version_incrementor.increment(version, 'major');
    
    it('should return the correct version', () => result.should.equal('2.0.0'));
});