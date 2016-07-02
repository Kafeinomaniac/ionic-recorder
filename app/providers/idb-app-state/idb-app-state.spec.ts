// Copyright (c) 2016 Tracktunes Inc

import {
    IdbAppState
} from './idb-app-state';

const WAIT_MSEC: number = 60;

let idbAppState: IdbAppState = new IdbAppState();

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

    it('can read lastTabIndex to be 1', (done) => {
        setTimeout(
            () => {
                idbAppState.getProperty('lastTabIndex').subscribe(
                    (idx: number) => {
                        expect(idx).toBe(1);
                        done();
                    }
                );
            },
            WAIT_MSEC);
    });

    it('can update lastTabIndex to be 2', (done) => {
        setTimeout(
            () => {
                idbAppState.updateProperty('lastTabIndex', 2).subscribe(
                    (bUpdated: boolean) => {
                        expect(bUpdated).toBe(true);
                        idbAppState.getProperty('lastTabIndex').subscribe(
                            (prop: any) => {
                                expect(prop).toBe(2);
                                done();
                            });
                    });
            },
            WAIT_MSEC);
    });

});
