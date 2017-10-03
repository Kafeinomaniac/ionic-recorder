// Copyright (c) 2017 Tracktunes Inc

import { Storage } from '@ionic/storage';
import { Filesystem } from '../../models';
import { AppFilesystem, WavInfo } from '../../services';
import { AUDIO_CONTEXT, SAMPLE_RATE } from '../../services/web-audio/common';

const WAIT_MSEC: number = 1,
      KEY: string = 'testKey';

let storage: Storage = new Storage({}),
    appFilesystem: AppFilesystem = new AppFilesystem(storage),
    dataLengthA: number = 10,
    dataLengthB: number = 10,
    dataLengthAB: number = dataLengthA + dataLengthB,
    dataA: Int16Array = new Int16Array(dataLengthA),
    dataB: Int16Array = new Int16Array(dataLengthA),
    dataAB: Int16Array = new Int16Array(dataLengthAB),
    audioBufferAB: AudioBuffer,
    audioBufferDataAB: Float32Array,
    i, j: number;

(function() {
    for (i = 0; i < dataLengthA; i++) {
        dataA[i] = i + 1;
        dataAB[i] = dataA[i];
    }
    for (j = 0; j < dataLengthB; j++) {
        dataB[j] = i + j + 1;
        dataAB[i+j] = dataB[j];
    }

    console.log('dataAB.buffer = ' + dataAB.buffer);

    AUDIO_CONTEXT.decodeAudioData(dataAB.buffer).then(
        (audioBuffer: AudioBuffer) => {
            audioBufferAB = audioBuffer;
            audioBufferDataAB = audioBuffer.getChannelData(0);
        }).catch((err1: any) => { console.error(err1); });;

})();

describe('services/app-filesystem', () => {
    it('AppFilesystem instance is not falsy', (done) => {
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
                appFilesystem.createWavFile('test.wav', dataA).subscribe(
                    () => {
                        done();
                    }
                );
            },
            WAIT_MSEC);
    });

    it('can read and verify the wav file header', (done) => {
        setTimeout(
            () => {
                appFilesystem.readWavFileHeader('test.wav').subscribe(
                    (wavHeaderInfo: WavInfo) => {
                        expect(wavHeaderInfo.nSamples).toEqual(10);
                        expect(wavHeaderInfo.sampleRate).toEqual(SAMPLE_RATE);
                        done();
                    }
                );
            },
            WAIT_MSEC);
    });

    it('can read and verify the wav file audio', (done) => {
        setTimeout(
            () => {
                appFilesystem.readWavFileAudio('test.wav').subscribe(
                    (audioBuffer: AudioBuffer) => {
                        done();
                    }
                );
            },
            WAIT_MSEC);
    });

    it('can add data (10 samples) to test.wav [11-20]', (done) => {
        setTimeout(
            () => {
                appFilesystem.appendToWavFile('test.wav', dataB).subscribe(
                    () => {
                        done();
                    }
                );
            },
            WAIT_MSEC);
    });

    it('can read and verify the wav file header', (done) => {
        setTimeout(
            () => {
                appFilesystem.readWavFileHeader('test.wav').subscribe(
                    (wavHeaderInfo: WavInfo) => {
                        expect(wavHeaderInfo.nSamples).toEqual(20);
                        expect(wavHeaderInfo.sampleRate).toEqual(SAMPLE_RATE);
                        done();
                    }
                );
            },
            WAIT_MSEC);
    });

    it('can read and verify the wav file audio', (done) => {
        setTimeout(
            () => {
                appFilesystem.readWavFileAudio('test.wav').subscribe(
                    (audioBuffer: AudioBuffer) => {
                        expect(audioBuffer).toEqual(audioBufferAB);
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
