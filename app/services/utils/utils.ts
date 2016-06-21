// Copyright (c) 2016 Tracktunes Inc

/**
 * Positive whole number test
 * @param {number} the number we're verifying
 * @returns {boolean} whether argument is a positive whole number
 */
export function positiveWholeNumber(num: number): boolean {
    'use strict';
    return (
        num &&
        !isNaN(num) &&
        num > 0 &&
        num === Math.floor(num)
    );
}
