// Copyright (c) 2016 Tracktunes Inc

export function copyFromObject(src: Object, dest: Object): Object {
    'use strict';
    for (let i in src) {
        if (src.hasOwnProperty(i)) {
            dest[i] = src[i];
        }
    }
    return dest;
}

export function prependArray(value: any, arr: any[]): any[] {
    'use strict';
    let newArray: any[] = arr.slice(0);
    newArray.unshift(value);
    return newArray;
}

export function removeByAttr(arr: any[], attr: string, value: any): any[] {
    'use strict';
    let i: number = arr.length;
    while (i--) {
        if (arr[i] &&
            arr[i].hasOwnProperty(attr) &&
            (arguments.length > 2 && arr[i][attr] === value)) {
            arr.splice(i, 1);
        }
    }
    return arr;
}

/**
 * objectInspector digs through a Javascript object
 * to display all its properties
 *
 * @param object - a Javascript object to inspect
 *
 * @return result - the concatenated description of all object properties
 */
export function objectInspector(object: Object): string {
    'use strict';
    let rows: Array<String> = [],
        key: string,
        count: number = 0;
    for (key in object) {
        rows.push([key, typeof object[key]].join(': '));
        count++;
    }
    return [
        'Type: ' + typeof object,
        'Length: ' + count,
        rows.join(' // ')
    ].join('\n');
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
export function makeTimestamp(): string {
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