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

import assert = require('assert');

describe('Arrays',
    function () {

        it('IndexOf returns the right position',
            function () {
                var a = [1, 8, 10];
                expect(indexOf(a, 1)).toEqual(0);
                expect(indexOf(a, 8)).toEqual(1);
                expect(indexOf(a, 10)).toEqual(2);
                expect(indexOf(a, 11)).toEqual(- 1);
                expect(indexOf([], 8)).toEqual(- 1);
            });

        it('IndexOf with custom equals function returns the right position',
            function () {

                let b = { val: 1 },
                    c = { val: 8 },
                    d = { val: 10 },
                    e = { val: 11 },
                    a = [b, c, d],

                    eq = function (arg1: any, arg2: any): boolean {
                        'use strict';
                        return arg1.val === arg2.val;
                    };

                expect(indexOf(a, { val: 1 })).toEqual(- 1);
                expect(indexOf(a, { val: 1 }, eq)).toEqual(0);
                expect(indexOf(a, c, eq)).toEqual(1);
                expect(indexOf(a, { val: 10 }, eq)).toEqual(2);
                expect(indexOf(a, e, eq)).toEqual(- 1);
                expect(indexOf([], b)).toEqual(- 1);
            });

        it('lastIndexOf returns the right position',
            function () {
                var a = [1, 8, 8, 8, 10, 10];
                expect(lastIndexOf(a, 1)).toEqual(0);
                expect(lastIndexOf(a, 8)).toEqual(3);
                expect(lastIndexOf(a, 10)).toEqual(5);
                expect(lastIndexOf(a, 11)).toEqual(- 1);
                expect(lastIndexOf([], 8)).toEqual(- 1);
            });

        it('lastIndexOf with custom equals function returns the right position',
            function () {

                let b = { val: 1 },
                    c = { val: 8 },
                    d = { val: 10 },
                    e = { val: 11 },
                    a = [b, b, c, d],
                    eq = function (arg1: any, arg2: any) {
                        return arg1.val === arg2.val;
                    };

                expect(lastIndexOf(a, { val: 1 })).toEqual(- 1);
                expect(lastIndexOf(a, { val: 1 }, eq)).toEqual(1);
            });

        it('Contains existing elements',
            function () {
                let a = [1, 8, 8, 8, 10, 10];
                expect(contains(a, 1)).toEqual(true);
                expect(contains(a, 8)).toEqual(true);
                expect(contains(a, 10)).toEqual(true);
                expect(contains(a, 11)).toEqual(false);
                expect(contains([], 8)).toEqual(false);
            });

        it('Contains existing elements with custom equals function',
            function () {
                let b = { val: 1 },
                    c = { val: 8 },
                    d = { val: 10 },
                    e = { val: 11 },
                    a = [b, b, c, d],
                    eq = function (arg1: any, arg2: any) {
                        return arg1.val === arg2.val;
                    };

                expect(contains(a, { val: 1 })).toEqual(false);
                expect(contains(a, { val: 1 },
                    eq)).toEqual(true);
                expect(contains(a, { val: 8 },
                    eq)).toEqual(true);
                expect(contains(a, { val: 10 }, eq)).toEqual(true);
                expect(contains(a, { val: 11 }, eq)).toEqual(false);
                expect(contains([], { val: 11 }, eq)).toEqual(false);
            });

        it('Gives the right frequency',
            function () {
                let a = [1, 8, 8, 8, 10, 10];
                expect(frequency(a, 1)).toEqual(1);
                expect(frequency(a, 8)).toEqual(3);
                expect(frequency(a, 10)).toEqual(2);
                expect(frequency(a, 11)).toEqual(0);
            });

        it('Gives the right frequency with custom equals',
            function () {
                let b = { val: 1 },
                    c = { val: 8 },
                    d = { val: 10 },
                    e = { val: 11 },
                    a = [b, b, c, d],
                    eq = function (arg1: any, arg2: any) {
                        return arg1.val === arg2.val;
                    };
                expect(frequency(a, { val: 1 })).toEqual(0);
                expect(frequency(a, { val: 1 },
                    eq)).toEqual(2);
                expect(frequency(a, { val: 8 },
                    eq)).toEqual(1);
            });

        it('Equal arrays are equal',
            function () {
                let a = [1, 8, 8, 8, 10, 10],
                    b = [1, 8, 8, 8, 10, 10],
                    c = [1, 8, 5, 8, 10, 10],
                    d = [1, 8, 8, 8, 10];

                expect(equals(a, a)).toEqual(true);
                expect(equals(a, b)).toEqual(true);
                expect(equals(a, [])).toEqual(false);
                expect(equals(a, c)).toEqual(false);
                expect(equals(a, d)).toEqual(false);
                expect(equals(a, [])).toEqual(false);
            });

        it('Equal arrays are equal with custom equals function',
            function () {
                let a = [{ val: 8 }],
                    b = [{ val: 8 }],
                    eq = function (arg1: any, arg2: any) {
                        return arg1.val === arg2.val;
                    };

                expect(equals(a, a)).toEqual(true);
                expect(equals(a, a, eq)).toEqual(true);
                expect(equals(a, b, eq)).toEqual(true);
                expect(equals(a, b)).toEqual(false);
            });

        it('Removes elements',
            function () {
                let a: any = [];
                expect(remove(a, 1)).toEqual(false);
                a = [4, 9, 9, 10];
                expect(remove(a, 9)).toEqual(true);
                expect(indexOf(a, 9)).toEqual(1);
                expect(indexOf(a, 10)).toEqual(2);
                expect(remove(a, 9)).toEqual(true);
                expect(remove(a, 9)).toEqual(false);
                expect(remove(a, 9)).toEqual(false);
            });

        it('Removes elements with custom equals function',
            function () {
                let c = { val: 8 },
                    d = { val: 10 },
                    a = [c, d],
                    eq = function (arg1: any, arg2: any) {
                        return arg1.val === arg2.val;
                    };

                expect(remove(a, { val: 10 })).toEqual(false);
                expect(remove(a, { val: 10 }, eq)).toEqual(true);
            });

        it('For each gives the right ordering',
            function () {
                let a: any = [],
                    i: number;
                forEach(a, function (e) {
                    expect(true).toEqual(false); // should not enter here
                });

                i = 0;
                for (i = 0; i < 10; i++) {
                    a.push(i);
                }

                i = 0;
                forEach(a, function (e) {
                    expect(e).toEqual(i);
                    i++;
                });
            });

        it('For each can be interrupted',
            function () {
                let a: any = [],
                    b: any = [];
                for (let i = 0; i < 5; i++) {
                    a.push(i);
                }
                forEach(a, function (e) {
                    b.push(e);
                    if (e === 3) {
                        return false;
                    }
                });

                expect([0, 1, 2, 3]).toEqual(b);
            });

        it('Copies existing arrays',
            function () {
                let a = [1, 8, 8, 8, 10, 10],
                    b = copy(a);
                expect(equals(a, b)).toEqual(true);
                expect(a === b).toEqual(false);
            });

        it('Swaps elements',
            function () {
                let a = [1, 8, 8, 8, 10, 10];
                expect(swap(a, 0, 5)).toEqual(true);
                expect(a[0]).toEqual(10);
                expect(a[5]).toEqual(1);
                expect(swap(a, 0, 6)).toEqual(false);
                expect(swap(a, 7, 2)).toEqual(false);
                expect(swap(a, -1, 9)).toEqual(false);
            });

    });
