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
    dataB: Int16Array = new Int16Array(dataLengthB),
    dataAB: Int16Array = new Int16Array(dataLengthAB),
    audioBufferAB: AudioBuffer;

function fillUpDataA(): void {
    for (let i: number = 0; i < dataLengthA; i++) {
            dataA[i] = i + 1;
            console.log('...A..... ' + dataA[i]);
    }    
}

function fillUpDataB(): void {
    for (let i: number = 0; i < dataLengthA; i++) {
            dataB[i] = i + 11;
            console.log('...B..... ' + dataA[i]);
    }
}

function fillUpDataAB(): void {
    for (let i: number = 0; i < dataLengthA; i++) {
        dataAB[i] = i + 1;
        console.log('...AB..... ' + dataAB[i]);
    }    
    for (let j: number = 0; j < dataLengthB; j++) {
        dataAB[j + 10] = j + 11;
        console.log('...AB..... ' + dataAB[j + 10]);
    }    
}

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
                fillUpDataA();
                console.log('DATA_A.LENGTH: ' + dataA.length);
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
                fillUpDataB();
                console.log('DATA_B.LENGTH: ' + dataB.length);
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

    it('can read (not yet verify) the wav file audio', (done) => {
        setTimeout(
            () => {
                appFilesystem.readWavFileAudio('test.wav').subscribe(
                    (audioBuffer: AudioBuffer) => {
                        // expect(audioBuffer).toEqual(audioBufferAB);
                        console.dir(audioBuffer);
                        console.dir(audioBuffer.getChannelData(0));
                        audioBufferAB = audioBuffer;
                        done();
                    }
                );
            },
            WAIT_MSEC);
    });

    it('can create test.wav with 20 samples - same data as appended one', (done) => {
        setTimeout(
            () => {
                fillUpDataAB();
                console.log('DATA_AB.LENGTH: ' + dataAB.length);
                appFilesystem.createWavFile('test.wav', dataAB).subscribe(
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

    it('can verify the wav file audio', (done) => {
        setTimeout(
            () => {
                appFilesystem.readWavFileAudio('test.wav').subscribe(
                    (audioBuffer: AudioBuffer) => {
                        // expect(audioBuffer).toEqual(audioBufferAB);
                        console.dir(audioBuffer);
                        console.dir(audioBuffer.getChannelData(0));
                        expect(audioBuffer).toEqual(audioBufferAB);
                        expect(audioBuffer.getChannelData(0))
                            .toEqual(audioBufferAB.getChannelData(0));
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
