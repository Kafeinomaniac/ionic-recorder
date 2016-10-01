// Copyright (c) 2016 Tracktunes Inc

import {
    IdbAppState
} from './idb-app-state';

import {
    isPositiveWholeNumber
} from '../../services/utils/utils';

const WAIT_MSEC: number = 60;

let idbAppState: IdbAppState = new IdbAppState(),
    savedTabIndex: number;

beforeEach((done: Function) => {
    idbAppState.waitForDB().subscribe(
        (database: IDBDatabase) => {
            done();
        },
        (error) => {
            fail(error);
        });
});

describe('When idbAppState initialized', () => {
    it('idbAppState is not falsy', (done) => {
        setTimeout(
            () => {
                expect(idbAppState).not.toBeFalsy();
                done();
            },
            WAIT_MSEC);
    });

    it('can read lastTabIndex', (done) => {
        setTimeout(
            () => {
                idbAppState.getProperty('lastTabIndex').subscribe(
                    (idx: number) => {
                        savedTabIndex = idx;
                        expect(isPositiveWholeNumber(idx)).toBe(true);
                        done();
                    }
                );
            },
            WAIT_MSEC);
    });

    it('can update lastTabIndex and read it', (done) => {
        setTimeout(
            () => {
                idbAppState.updateProperty('lastTabIndex', 9999).subscribe(
                    (bUpdated: boolean) => {
                        expect(bUpdated).toBe(true);
                        idbAppState.getProperty('lastTabIndex').subscribe(
                            (prop: any) => {
                                expect(prop).toBe(9999);
                                done();
                            });
                    });
            },
            WAIT_MSEC);
    });

    it('can update lastTabIndex back to what it was', (done) => {
        setTimeout(
            () => {
                idbAppState.updateProperty('lastTabIndex', savedTabIndex)
                    .subscribe(
                    (bUpdated: boolean) => {
                        expect(bUpdated).toBe(true);
                        idbAppState.getProperty('lastTabIndex').subscribe(
                            (prop: any) => {
                                expect(prop).toBe(savedTabIndex);
                                done();
                            });
                    });
            },
            WAIT_MSEC);
    });
});
