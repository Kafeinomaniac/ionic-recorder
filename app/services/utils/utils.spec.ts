// Copyright (c) 2016 Tracktunes Inc

import {
    positiveWholeNumber
} from './utils';

describe('utils', () => {
    it('positiveWholeNumber() works as expected', (done) => {
        expect(positiveWholeNumber(1)).toBeTruthy();
        expect(positiveWholeNumber(0)).toBeFalsy();
        expect(positiveWholeNumber(-1)).toBeFalsy();
        expect(positiveWholeNumber(1.1)).toBeFalsy();
        done();
    });
});
