// Copyright (c) 2017 Tracktunes Inc

import { AppStorage } from './app-storage';
import { isPositiveWholeNumber } from '../../models/utils/utils';
import { Storage } from '@ionic/storage';

const WAIT_MSEC: number = 500,
      SOME_IDX: number = 9999;

let storage: Storage = new Storage({}),
    appStorage: AppStorage = new AppStorage(storage),
    savedTabIndex: number = -1;

describe('services/app-storage', () => {
    it('appStorage is not falsy', (done) => {
        setTimeout(
            () => {
                expect(appStorage).not.toBeFalsy();
                done();
            },
            WAIT_MSEC);
    });

    it('can read lastTabIndex', (done) => {
        setTimeout(
            () => {
                appStorage.get('lastTabIndex').then(
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
                appStorage.set('lastTabIndex', SOME_IDX);
                done();
            },
            WAIT_MSEC);
    });

    it('can get lastTabIndex as ' + SOME_IDX, (done) => {
        setTimeout(
            () => {
                appStorage.get('lastTabIndex').then(
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
                appStorage.set('lastTabIndex', savedTabIndex);
                done();
            },
            WAIT_MSEC);
    });

    it('can get lastTabIndex back to what it was originally', (done) => {
        setTimeout(
            () => {
                appStorage.get('lastTabIndex').then(
                    (prop: any) => {
                        expect(prop).toBe(savedTabIndex);
                        done();
                    });
            },
            WAIT_MSEC);
    });

});
