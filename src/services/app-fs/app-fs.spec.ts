// Copyright (c) 2017 Tracktunes Inc

import { AppFS } from '../../services';
import { Storage } from '@ionic/storage';
import { FS } from '../../models';

const WAIT_MSEC: number = 1,
      KEY: string = 'testKey';

let storage: Storage = new Storage({}),
    appFS: AppFS = new AppFS(storage);

describe('services/app-fs', () => {
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

    it('can create test.wav with 10 samples [1-10]', (done) => {
        setTimeout(
            () => {
                let dataLength: number = 10,
                    data: Int16Array = new Int16Array(dataLength),
                    i: number;
                for (i = 0; i < dataLength; i++) {
                    data[i] = i + 1;
                }
                appFS.createWavFile('test.wav', data).subscribe(
                    () => {
                        done();
                    }
                );
            },
            WAIT_MSEC);
    });

    it('can add data (10 samples) to test.wav [11-20]', (done) => {
        setTimeout(
            () => {
                let dataLength: number = 10,
                    data: Int16Array = new Int16Array(dataLength),
                    i: number;
                for (i = 0; i < dataLength; i++) {
                    data[i] = i + 11;
                }
                appFS.appendToWavFile('test.wav', data).subscribe(
                    () => {
                        done();
                    }
                );
            },
            WAIT_MSEC);
    });

    it('can clean up (remove test.wav)', (done) => {
        setTimeout(
            () => {
                appFS.selectPath('test.wav');
                appFS.deleteSelected().subscribe(
                    () => {
                        appFS.clearSelection();
                        done();
                    }
                );
            },
            WAIT_MSEC);
    });

});
