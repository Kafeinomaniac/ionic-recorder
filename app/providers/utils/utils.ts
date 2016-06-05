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
