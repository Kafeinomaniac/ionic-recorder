// Copyright (c) 2016 Tracktunes Inc

// not efficient but sufficient and clear
export function num2str(num: number, nDecimals: number) {
    'use strict';
    let floorNum: number = Math.floor(num),
        frac: number = num - floorNum,
        pow10: number = Math.pow(10, nDecimals),
        wholeFrac: number = Math.round(frac * pow10),
        fracLen: number = wholeFrac.toString().length,
        leadingZeros: string = Array(nDecimals - fracLen + 1).join('0');
    return floorNum.toString() + '.' + leadingZeros + wholeFrac.toString();
}

const addZero = (n: number) => { return (n < 10) ? '0' : ''; };

// not efficient but sufficient and clear
export function msec2time(msec: number) {
    'use strict';
    let totalSec: number = Math.floor(msec / 1000),
        totalMin: number = Math.floor(totalSec / 60),
        hr: number = Math.floor(totalMin / 60),
        min: number = totalMin - hr * 60,
        sec: number = totalSec - totalMin * 60,
        secFrac: number = Math.floor((msec - totalSec * 1000) / 10);
    return [addZero(hr), hr, ':', addZero(min), min, ':',
        addZero(sec), sec, '.', secFrac, addZero(secFrac)].join('');
}

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

// arrayEqual from: http://stackoverflow.com/questions/3115982/how-to-check-javascript-array-equals
export function arrayEqual(a, b) { return !(a < b || b < a); };