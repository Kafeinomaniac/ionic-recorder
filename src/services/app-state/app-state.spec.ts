// Copyright (c) 2017 Tracktunes Inc

import { AppState } from './app-state';
import { isPositiveWholeNumber } from '../../models/utils/utils';
import { Storage } from '@ionic/storage';

const WAIT_MSEC: number = 60,
      SOME_IDX: number = 9999;

let storage: Storage = new Storage({}),
    appState: AppState = new AppState(storage),
    savedTabIndex: number = -1;

describe('When appState initialized', () => {
    it('appState is not falsy', (done) => {
        setTimeout(
            () => {
                expect(appState).not.toBeFalsy();
                done();
            },
            WAIT_MSEC);
    });

    it('can read lastTabIndex', (done) => {
        setTimeout(
            () => {
                appState.get('lastTabIndex').then(
                    (idx: number) => {
                        savedTabIndex = idx;
                        expect(isPositiveWholeNumber(idx)).toBe(true);
                        done();
                    }
                );
            },
            WAIT_MSEC);
    });

    it('can update lastTabIndex to ' + SOME_IDX, (done) => {
        setTimeout(
            () => {
                appState.set('lastTabIndex', SOME_IDX);
                done();
            },
            WAIT_MSEC);
    });

    it('can get lastTabIndex as ' + SOME_IDX, (done) => {
        setTimeout(
            () => {
                appState.get('lastTabIndex').then(
                    (prop: any) => {
                        expect(prop).toBe(SOME_IDX);
                        done();
                    });
            },
            WAIT_MSEC);
    });

    it('can update lastTabIndex back to what it was originally', (done) => {
        setTimeout(
            () => {
                appState.set('lastTabIndex', savedTabIndex);
                done();
            },
            WAIT_MSEC);
    });

    it('can get lastTabIndex back to what it was originally', (done) => {
        setTimeout(
            () => {
                appState.get('lastTabIndex').then(
                    (prop: any) => {
                        expect(prop).toBe(savedTabIndex);
                        done();
                    });
            },
            WAIT_MSEC);
    });

});
