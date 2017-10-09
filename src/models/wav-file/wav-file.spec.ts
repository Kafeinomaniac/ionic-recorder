// Copyright (c) 2017 Tracktunes Inc
/*
import { Storage } from '@ionic/storage';
import { AppFilesystem } from '../../services';
import { WavFile, WavInfo } from '../../models';
import { AUDIO_CONTEXT, SAMPLE_RATE } from '../../services/web-audio/common';

const WAIT_MSEC: number = 1;

let storage: Storage = new Storage({}),
    appFilesystem: AppFilesystem = new AppFilesystem(storage),
    dataLengthA: number = 10,
    dataLengthB: number = 10,
    dataLengthAB: number = dataLengthA + dataLengthB,
    dataA: Int16Array = new Int16Array(dataLengthA),
    dataB: Int16Array = new Int16Array(dataLengthB),
    dataAB: Int16Array = new Int16Array(dataLengthAB),
    // audioBufferAB is remembered in one test and it is used
    // after the test in another test's' expect().toEqual()
    audioBufferAB: AudioBuffer;

function fillUpDataA(): void {
    for (let i: number = 0; i < dataLengthA; i++) {
        dataA[i] = i + 1;
        // console.log('...A..... ' + dataA[i]);
    }
}

function fillUpDataB(): void {
    for (let i: number = 0; i < dataLengthA; i++) {
        dataB[i] = i + 11;
        // console.log('...B..... ' + dataA[i]);
    }
}

function fillUpDataAB(): void {
    for (let i: number = 0; i < dataLengthA; i++) {
        dataAB[i] = i + 1;
        // console.log('...AB..... ' + dataAB[i]);
    }
    for (let j: number = 0; j < dataLengthB; j++) {
        dataAB[j + 10] = j + 11;
        // console.log('...AB..... ' + dataAB[j + 10]);
    }
}

describe('models/wav-file', () => {

    it('can create test.wav with 10 samples [1-10]', () => {
        fillUpDataA();
        // console.log('DATA_A.LENGTH: ' + dataA.length);
        WavFile.createWavFile('test.wav', dataA).subscribe(
            () => {
                expect(true).toBe(true);
            }
        );
    });

    it('can read and verify the wav file header', () => {
        WavFile.readWavFileHeader('test.wav').subscribe(
            (wavHeaderInfo: WavInfo) => {
                expect(wavHeaderInfo.nSamples).toEqual(10);
                expect(wavHeaderInfo.sampleRate).toEqual(SAMPLE_RATE);
            }
        );
    });

    it('can read and verify the wav file audio', () => {
        WavFile.readWavFileAudio('test.wav').subscribe(
            (audioBuffer: AudioBuffer) => {
                expect(true).toBe(true);
            }
        );
    });

    it('can add data (10 samples) to test.wav [11-20]', () => {
        fillUpDataB();
        console.log('DATA_B.LENGTH: ' + dataB.length);
        WavFile.appendToWavFile('test.wav', dataB, 10).subscribe(
            () => {
                expect(true).toBe(true);
            }
        );
    });

    it('can read and verify the wav file header', () => {
        WavFile.readWavFileHeader('test.wav').subscribe(
            (wavHeaderInfo: WavInfo) => {
                expect(wavHeaderInfo.nSamples).toEqual(20);
                expect(wavHeaderInfo.sampleRate).toEqual(SAMPLE_RATE);
            }
        );
    });

    it('can read (not yet verify) the wav file audio', () => {
        WavFile.readWavFileAudio('test.wav').subscribe(
            (audioBuffer: AudioBuffer) => {
                // expect(audioBuffer).toEqual(audioBufferAB);
                // console.dir(audioBuffer);
                // console.dir(audioBuffer.getChannelData(0));
                audioBufferAB = audioBuffer;
                expect(true).toBe(true);
            }
        );
    });

    it('can create test.wav w/20 samples (same as appended file above)', () => {
        fillUpDataAB();
        // console.log('DATA_AB.LENGTH: ' + dataAB.length);
        WavFile.createWavFile('test.wav', dataAB).subscribe(
            () => {
                expect(true).toBe(true);
            }
        );
    });

    it('can read and verify the wav file header', () => {
        WavFile.readWavFileHeader('test.wav').subscribe(
            (wavHeaderInfo: WavInfo) => {
                expect(wavHeaderInfo.nSamples).toEqual(20);
                expect(wavHeaderInfo.sampleRate).toEqual(SAMPLE_RATE);
            }
        );
    });

    it('can verify the wav file audio against previously created', () => {
        WavFile.readWavFileAudio('test.wav').subscribe(
            (audioBuffer: AudioBuffer) => {
                expect(audioBuffer).toEqual(audioBufferAB);
                expect(audioBuffer.getChannelData(0))
                    .toEqual(audioBufferAB.getChannelData(0));
            }
        );
    });

    it('can read and verify a wav file data chunk', () => {
        WavFile.readWavFileAudio('test.wav', 10, 20).subscribe(
            (audioBuffer: AudioBuffer) => {
                expect(audioBuffer.getChannelData(0))
                    .toEqual(audioBufferAB.getChannelData(0).slice(10, 20));
            }
        );
    });

    it('can clean up (remove test.wav)', () => {
        appFilesystem.selectPath('test.wav');
        appFilesystem.deleteSelected().subscribe(
            () => {
                appFilesystem.clearSelection();
            });
    });

});
*/
