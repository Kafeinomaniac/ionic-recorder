// Copyright (c) 2016 Tracktunes Inc

import {
    isPositiveWholeNumber
} from './utils';

describe('utils/utils:isPositiveWholeNumber()', () => {
    it('works as expected', (done) => {
        expect(isPositiveWholeNumber(1)).toBeTruthy();
        expect(isPositiveWholeNumber(0)).toBeFalsy();
        expect(isPositiveWholeNumber(-1)).toBeFalsy();
        expect(isPositiveWholeNumber(1.1)).toBeFalsy();
        done();
    });
});
