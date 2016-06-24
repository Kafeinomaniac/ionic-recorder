// Copied from
// github.com/basarat/typescript-collections/blob/release/src/test/arraysTest.ts

import {
    indexOf,
    lastIndexOf,
    contains,
    frequency,
    equals,
    remove,
    forEach,
    swap,
    copy
} from './arrays';

interface ObjV {
    val: number;
}

describe('Arrays', () => {

    it('IndexOf returns true position', () => {
        let a: number[] = [1, 8, 10];
        expect(indexOf(a, 1)).toBe(0);
        expect(indexOf(a, 8)).toBe(1);
        expect(indexOf(a, 10)).toBe(2);
        expect(indexOf(a, 11)).toBe(-1);
        expect(indexOf([], 8)).toBe(-1);
    });

    it('IndexOf with custom equals function returns true position', () => {
        let b: ObjV = { val: 1 },
            c: ObjV = { val: 8 },
            d: ObjV = { val: 10 },
            e: ObjV = { val: 11 },
            a: ObjV[] = [b, c, d],

            eq: (arg1: any, arg2: any) => boolean = (arg1: any, arg2: any) => {
                'use strict';
                return arg1.val === arg2.val;
            };

        expect(indexOf(a, { val: 1 })).toBe(-1);
        expect(indexOf(a, { val: 1 }, eq)).toBe(0);
        expect(indexOf(a, c, eq)).toBe(1);
        expect(indexOf(a, { val: 10 }, eq)).toBe(2);
        expect(indexOf(a, e, eq)).toBe(-1);
        expect(indexOf([], b)).toBe(-1);
    });

    it('lastIndexOf returns true position', () => {
        let a: number[] = [1, 8, 8, 8, 10, 10];
        expect(lastIndexOf(a, 1)).toBe(0);
        expect(lastIndexOf(a, 8)).toBe(3);
        expect(lastIndexOf(a, 10)).toBe(5);
        expect(lastIndexOf(a, 11)).toBe(-1);
        expect(lastIndexOf([], 8)).toBe(-1);
    });

    it('lastIndexOf with custom equals function returns true position', () => {
        let b: ObjV = { val: 1 },
            c: ObjV = { val: 8 },
            d: ObjV = { val: 10 },
            a: ObjV[] = [b, b, c, d],
            eq: (arg1: any, arg2: any) => boolean = (arg1: any, arg2: any) => {
                return arg1.val === arg2.val;
            };
        expect(lastIndexOf(a, { val: 1 })).toBe(-1);
        expect(lastIndexOf(a, { val: 1 }, eq)).toBe(1);
    });

    it('Contains existing elements', () => {
        let a: number[] = [1, 8, 8, 8, 10, 10];
        expect(contains(a, 1)).toBe(true);
        expect(contains(a, 8)).toBe(true);
        expect(contains(a, 10)).toBe(true);
        expect(contains(a, 11)).toBe(false);
        expect(contains([], 8)).toBe(false);
    });

    it('Contains existing elements with custom equals function', () => {
        let b: ObjV = { val: 1 },
            c: ObjV = { val: 8 },
            d: ObjV = { val: 10 },
            a: ObjV[] = [b, b, c, d],
            eq: (arg1: any, arg2: any) => boolean = (arg1: any, arg2: any) => {
                return arg1.val === arg2.val;
            };

        expect(contains(a, { val: 1 })).toBe(false);
        expect(contains(a, { val: 1 }, eq)).toBe(true);
        expect(contains(a, { val: 8 }, eq)).toBe(true);
        expect(contains(a, { val: 10 }, eq)).toBe(true);
        expect(contains(a, { val: 11 }, eq)).toBe(false);
        expect(contains([], { val: 11 }, eq)).toBe(false);
    });

    it('Gives the right frequency', () => {
        let a: number[] = [1, 8, 8, 8, 10, 10];
        expect(frequency(a, 1)).toBe(1);
        expect(frequency(a, 8)).toBe(3);
        expect(frequency(a, 10)).toBe(2);
        expect(frequency(a, 11)).toBe(0);
    });

    it('Gives the right frequency with custom equals', () => {
        let b: ObjV = { val: 1 },
            c: ObjV = { val: 8 },
            d: ObjV = { val: 10 },
            a: ObjV[] = [b, b, c, d],
            eq: (arg1: any, arg2: any) => boolean = (arg1: any, arg2: any) => {
                return arg1.val === arg2.val;
            };
        expect(frequency(a, { val: 1 })).toBe(0);
        expect(frequency(a, { val: 1 }, eq)).toBe(2);
        expect(frequency(a, { val: 8 }, eq)).toBe(1);
    });

    it('Equal arrays are equal', () => {
        let a: number[] = [1, 8, 8, 8, 10, 10],
            b: number[] = [1, 8, 8, 8, 10, 10],
            c: number[] = [1, 8, 5, 8, 10, 10],
            d: number[] = [1, 8, 8, 8, 10];

        expect(equals(a, a)).toBe(true);
        expect(equals(a, b)).toBe(true);
        expect(equals(a, [])).toBe(false);
        expect(equals(a, c)).toBe(false);
        expect(equals(a, d)).toBe(false);
        expect(equals(a, [])).toBe(false);
    });

    it('Equal arrays are equal with custom equals function', () => {
        let a: ObjV[] = [{ val: 8 }],
            b: ObjV[] = [{ val: 8 }],
            eq: (arg1: any, arg2: any) => boolean = (arg1: any, arg2: any) => {
                return arg1.val === arg2.val;
            };

        expect(equals(a, a)).toBe(true);
        expect(equals(a, a, eq)).toBe(true);
        expect(equals(a, b, eq)).toBe(true);
        expect(equals(a, b)).toBe(false);
    });

    it('Removes elements', () => {
        let a: number[] = [];
        expect(remove(a, 1)).toBe(false);
        a = [4, 9, 9, 10];
        expect(remove(a, 9)).toBe(true);
        expect(indexOf(a, 9)).toBe(1);
        expect(indexOf(a, 10)).toBe(2);
        expect(remove(a, 9)).toBe(true);
        expect(remove(a, 9)).toBe(false);
        expect(remove(a, 9)).toBe(false);
    });

    it('Removes elements with custom equals function', () => {
        let c: ObjV = { val: 8 },
            d: ObjV = { val: 10 },
            a: ObjV[] = [c, d],
            eq: (arg1: any, arg2: any) => boolean = (arg1: any, arg2: any) => {
                return arg1.val === arg2.val;
            };

        expect(remove(a, { val: 10 })).toBe(false);
        expect(remove(a, { val: 10 }, eq)).toBe(true);
    });

    it('For each gives the right ordering', () => {
        let a: number[] = [],
            i: number;
        forEach(a, (e: number): void => {
            expect(true).toBe(false); // should not enter here
        });

        i = 0;
        for (i = 0; i < 10; i++) {
            a.push(i);
        }

        i = 0;
        forEach(a, (e: number): void => {
            expect(e).toEqual(i);
            i++;
        });
    });

    it('For each can be interrupted', () => {
        let a: number[] = [],
            b: number[] = [],
            i: number;
        for (i = 0; i < 5; i++) {
            a.push(i);
        }
        forEach(a, (e: number): boolean => {
            b.push(e);
            if (e === 3) {
                return false;
            }
        });

        expect([0, 1, 2, 3]).toEqual(b);
    });

    it('Copies existing arrays', () => {
        let a: number[] = [1, 8, 8, 8, 10, 10],
            b: number[] = copy(a);
        expect(equals(a, b)).toBe(true);
        expect(a === b).toBe(false);
    });

    it('Swaps elements', () => {
        let a: number[] = [1, 8, 8, 8, 10, 10];
        expect(swap(a, 0, 5)).toBe(true);
        expect(a[0]).toBe(10);
        expect(a[5]).toBe(1);
        expect(swap(a, 0, 6)).toBe(false);
        expect(swap(a, 7, 2)).toBe(false);
        expect(swap(a, -1, 9)).toBe(false);
    });

});
