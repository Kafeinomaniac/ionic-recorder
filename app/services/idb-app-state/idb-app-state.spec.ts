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
                expect(idbAppState.getProperty('lastTabIndex')).toBe(1);
                done();
            },
            WAIT_MSEC);
    });

    it('can update unfiledFolderKey to be 0', (done) => {
        setTimeout(
            () => {
                idbAppState.updateProperty('unfiledFolderKey', 0);
                expect(idbAppState.getProperty('unfiledFolderKey')).toBe(0);
                done();
            },
            WAIT_MSEC);
    });
});
