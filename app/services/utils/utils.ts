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

/**
 * format time into H*:MM:SS.CC
 * @param {number} - number of seconds, float
 * @param {number} - maximum time, determines final string length/components
 * @return {string} - the time string representation
 */
export function formatTime(
    timeInSeconds: number,
    maxTimeInSeconds: number = Infinity
): string {
    'use strict';
    let nSeconds: number = Math.floor(timeInSeconds),
        // initialize the result with the centiseconds portion and period
        result: string = (timeInSeconds - nSeconds).toFixed(2).substr(1),
        addZero: (num: number) => string = (num: number) => {
            return (num < 10) ? '0' : '';
        };

    if (timeInSeconds < 60 && maxTimeInSeconds < 60) {
        // no minutes
        result = addZero(nSeconds) + nSeconds.toString() + result;
    }
    else {
        // yes minutes
        let nMinutes: number = Math.floor(nSeconds / 60.0);
        nSeconds -= nMinutes * 60;
        result = ':' + addZero(nSeconds) + nSeconds.toString() + result;
        if (timeInSeconds < 3600 && maxTimeInSeconds < 3600) {
            // no hours
            result = addZero(nMinutes) + nMinutes.toString() + result;
        }
        else {
            // yes hours
            let nHours: number = Math.floor(nMinutes / 60.0);
            nMinutes -= nHours * 60;
            result = nHours.toString() + ':' + addZero(nMinutes) +
                nMinutes.toString() + result;
        }
    }
    return result;
}

/**
 * Create a string that reflects the time now, at 1 second resolution
 * @return {string} - human readable text representation of time now
 */
export function makeSecondsTimestamp(): string {
    'use strict';
    let now: Date = new Date();
    return [
        now.getFullYear().toString(),
        '-',
        (now.getMonth() + 1).toString(),
        '-',
        now.getDate().toString(),
        ' -- ',
        now.toLocaleTimeString()
    ].join('');
}
