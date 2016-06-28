// // Copyright (c) 2016 Tracktunes Inc

import {
    IdbDict
} from '../idb/idb-dict';

import {
    AppState
} from '../app-state/app-state';

const WAIT_MSEC: number = 60;
const DB_NAME: string = 'testAppStateIdbDict';
const DB_VERSION: number = 1;

let idbDict: IdbDict = new IdbDict(DB_NAME, DB_VERSION),
    appState = new AppState(idbDict);

beforeEach((done: Function) => {
    idbDict.waitForDB().subscribe(
        (database: IDBDatabase) => {
            done();
        },
        (error) => {
            fail(error);
        });
});

describe('When appState initialized', () => {
    it('appState is not falsy', (done) => {
        setTimeout(
            () => {
                expect(appState).not.toBeFalsy();
                done();
            },
            WAIT_MSEC);
    });

    it('can read lastTabIndex to be 1', (done) => {
        setTimeout(
            () => {
                expect(appState.getProperty('lastTabIndex')).toBe(1);
                done();
            },
            WAIT_MSEC);
    });

    it('can update unfiledFolderKey to be 0', (done) => {
        setTimeout(
            () => {
                appState.updateProperty('unfiledFolderKey', 0);
                expect(appState.getProperty('unfiledFolderKey')).toBe(0);
                done();
            },
            WAIT_MSEC);
    });
});
