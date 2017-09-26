// Copyright (c) 2017 Tracktunes Inc

import { AppFileystem } from '../../services';
import { Storage } from '@ionic/storage';
import { Filesystem } from '../../models';

const WAIT_MSEC: number = 1,
      KEY: string = 'testKey';

let storage: Storage = new Storage({}),
    appFilesystem: AppFileystem = new AppFileystem(storage);

describe('services/app-fs', () => {
    it('AppFileystem instance is not falsy', (done) => {
        setTimeout(
            () => {
                expect(appFilesystem).not.toBeFalsy();
                expect(appFilesystem.isReady).toBeTruthy();
                expect(appFilesystem.selectedPaths).not.toBeFalsy();
                expect(typeof appFilesystem.selectedPaths).toEqual('object');
                expect(appFilesystem.nSelected()).toEqual(0);
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
                appFilesystem.createWavFile('test.wav', data).subscribe(
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
                appFilesystem.appendToWavFile('test.wav', data).subscribe(
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
                appFilesystem.selectPath('test.wav');
                appFilesystem.deleteSelected().subscribe(
                    () => {
                        appFilesystem.clearSelection();
                        done();
                    }
                );
            },
            WAIT_MSEC);
    });

});
