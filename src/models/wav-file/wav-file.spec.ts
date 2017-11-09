// Copyright (c) 2017 Tracktunes Inc

import { WavFile, WavInfo } from './wav-file';
import { SAMPLE_RATE, AppFilesystem } from '../../services/';

const TEST_FILE_PATH: string = '/test.wav';
const TEST_FILE_PATH2: string = '/test2.wav';

let appFilesystem: AppFilesystem = new AppFilesystem(),
    dataA: Int16Array = Int16Array.from([1, 2, 3, 4, 5, 6, 7 ]),
    dataB: Int16Array = Int16Array.from([8, 9, 10, 11]),
    dataAB: Int16Array = Int16Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
    lengthA: number = dataA.length,
    lengthB: number = dataB.length,
    lengthAB: number = dataAB.length,
    audioBufferAB: AudioBuffer = null;

describe('models/wav-file', () => {

    it('can create ' + TEST_FILE_PATH + ' nSamples = ' + lengthA, (done) => {
        WavFile.createWavFile(TEST_FILE_PATH, dataA).subscribe(
            () => {
                done();
            }
        );
    });

    it('can read and verify wav file header', (done) => {
        WavFile.readWavFileInfo(TEST_FILE_PATH).subscribe(
            (wavHeaderInfo: WavInfo) => {
                expect(wavHeaderInfo.nSamples).toEqual(lengthA);
                expect(wavHeaderInfo.sampleRate).toEqual(SAMPLE_RATE);
                done();
            }
        );
    });

    it('can read and verify the wav file audio', (done) => {
        WavFile.readWavFileAudio(TEST_FILE_PATH).subscribe(
            (audioBuffer: AudioBuffer) => {
                done();
            }
        );
    });

    it('can add ' + lengthB + ' samples to ' + TEST_FILE_PATH, (done) => {
        WavFile.appendToWavFile(TEST_FILE_PATH, dataB, lengthA)
            .subscribe(
                () => {
                    done();
                }
            );
    });

    it('can read and verify the wav file header', (done) => {
        WavFile.readWavFileInfo(TEST_FILE_PATH).subscribe(
            (wavHeaderInfo: WavInfo) => {
                expect(wavHeaderInfo.nSamples).toEqual(lengthAB);
                expect(wavHeaderInfo.sampleRate).toEqual(SAMPLE_RATE);
                done();
            }
        );
    });

    it('can read (and save, for later comparison) wav file audio', (done) => {
        WavFile.readWavFileAudio(TEST_FILE_PATH).subscribe(
            (audioBuffer: AudioBuffer) => {
                audioBufferAB = audioBuffer;
                expect(audioBufferAB).not.toBeNull();
                done();
            }
        );
    });

    /*
    it('can remove the file it just created', (done) => {
        appFilesystem.selectPath(TEST_FILE_PATH);
        appFilesystem.deleteSelected().subscribe(
            () => {
                appFilesystem.clearSelection();
                done();
            }
        );
    });
    */

    it('can recreate in ' + TEST_FILE_PATH2 + ' all at once', (done) => {
        WavFile.createWavFile(TEST_FILE_PATH2, dataAB).subscribe(
            () => {
                done();
            }
        );
    });

    it('can read and verify the wav file header', (done) => {
        WavFile.readWavFileInfo(TEST_FILE_PATH2).subscribe(
            (wavHeaderInfo: WavInfo) => {
                expect(wavHeaderInfo.nSamples).toEqual(lengthAB);
                expect(wavHeaderInfo.sampleRate).toEqual(SAMPLE_RATE);
                done();
            }
        );
    });

    it('can verify the wav file audio against previously created', (done) => {
        WavFile.readWavFileAudio(TEST_FILE_PATH2).subscribe(
            (audioBuffer: AudioBuffer) => {
                expect(audioBuffer).toEqual(audioBufferAB);
                expect(audioBuffer.getChannelData(0))
                    .toEqual(audioBufferAB.getChannelData(0));
                done();
            }
        );
    });

    it('can read verify a wav file decoded chunk', (done) => {
        WavFile.readWavFileAudio(TEST_FILE_PATH2, lengthA, lengthAB).subscribe(
            (audioBuffer: AudioBuffer) => {
                expect(audioBuffer.getChannelData(0))
                    .toEqual(audioBufferAB.getChannelData(0)
                             .slice(lengthA, lengthAB));
                done();
            }
        );
    });

    it('can clean up', (done) => {
        // appFilesystem.selectPath(TEST_FILE_PATH2);
        // appFilesystem.deleteSelected().subscribe(
        appFilesystem.deletePaths([
            TEST_FILE_PATH,
            TEST_FILE_PATH2
        ]).subscribe(
            () => {
                appFilesystem.clearSelection();
                done();
            });
    });

});
