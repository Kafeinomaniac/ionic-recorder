// Copyright (c) 2017 Tracktunes Inc

import { AppFS } from '../../services';
import { Storage } from '@ionic/storage';

const WAIT_MSEC: number = 1,
      KEY: string = 'testKey';

let storage: Storage = new Storage({}),
    appFS: AppFS = new AppFS(storage);

describe('When AppFS is ready ...', () => {
    it('AppFS instance is not falsy', (done) => {
        setTimeout(
            () => {
                expect(appFS).not.toBeFalsy();
                expect(appFS.isReady).toBeTruthy();
                expect(appFS.selectedPaths).not.toBeFalsy();
                expect(typeof appFS.selectedPaths).toEqual('object');
                expect(appFS.nSelected()).toEqual(0);
                done();
            },
            WAIT_MSEC);
    });

});
