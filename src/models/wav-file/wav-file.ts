// Copyright (c) 2017 Tracktunes Inc

import { Observable } from 'rxjs/Rx';
import { Filesystem } from '../../models';
import { AUDIO_CONTEXT, SAMPLE_RATE } from '../../services/web-audio/common';

export interface WavInfo {
    nSamples: number;
    sampleRate: number;
}

export class WavFile {

    public static nHeaderBytes: number = 44;

    public static mimeType: string = 'audio/wav';

    public static sampleToByte(iSample: number): number {
        return WavFile.nHeaderBytes + 2 * iSample;
    }

    public static byteToSample(iByte: number): number {
        return iByte / 2 - WavFile.nHeaderBytes;
    }

    // see: http://soundfile.sapp.org/doc/WaveFormat/
    public static makeWavBlobHeaderView(
        nSamples: number,
        sampleRate: number
    ): DataView {
        const arrayByteLength: number = 2 * nSamples,
              arrayBuffer: ArrayBuffer = new ArrayBuffer(WavFile.nHeaderBytes),
              headerView: DataView = new DataView(arrayBuffer),
              writeAscii:
              (dataView: DataView, offset: number, text: string) => void =
              (dataView: DataView, offset: number, text: string) => {
                  const len: number = text.length;
                  for (let i: number = 0; i < len; i++) {
                      dataView.setUint8(offset + i, text.charCodeAt(i));
                  }
              };

        //
        // NB: this is single-channel (mono)
        //

        //   0-4: ChunkId
        writeAscii(headerView, 0, 'RIFF');
        //   4-8: ChunkSize
        headerView.setUint32(4, 36 + arrayByteLength, true);
        //  8-12: Format
        writeAscii(headerView, 8, 'WAVE');
        // 12-16: Subchunk1ID
        writeAscii(headerView, 12, 'fmt ');
        // 16-20: Subchunk1Size
        headerView.setUint32(16, 16, true);
        // 20-22: AudioFormat
        headerView.setUint16(20, 1, true);
        // 22-24: NumChannels
        headerView.setUint16(22, 1, true);
        // 24-28: SampleRate
        headerView.setUint32(24, sampleRate, true);
        // 28-32: ByteRate
        headerView.setUint32(28, sampleRate * 2, true);
        // 32-34: BlockAlign
        headerView.setUint16(32, 2, true);
        // 34-36: BitsPerSample
        headerView.setUint16(34, 16, true);
        // 36-40: Subchunk2ID
        writeAscii(headerView, 36, 'data');
        // 40-44: Subchunk2Size
        headerView.setUint32(40, arrayByteLength, true);

        return headerView;
    }

    /**
     *
     */
    public static readWavFileHeader(
        filePath: string
    ): Observable<WavInfo> {
        console.log('readWavFileHeader(' + filePath + ')');
        let fs: FileSystem = this.fileSystem,
            obs: Observable<WavInfo> = Observable.create((observer) => {
                Filesystem.readFromFile(fs, filePath, 24, 28).subscribe(
                    (data1: any) => {
                        const view1: DataView = new DataView(data1),
                              sampleRate: number = view1.getUint32(0, true);
                        Filesystem.readFromFile(fs, filePath, 40, 44).subscribe(
                            (data2: any) => {
                                const view2: DataView = new DataView(data2),
                                      subchunk2Size: number =
                                      view2.getUint32(0, true),
                                      nSamples: number = subchunk2Size / 2;
                                observer.next({
                                    nSamples: nSamples,
                                    sampleRate: sampleRate
                                });
                                observer.complete();
                            },
                            (err1: any) => {
                                observer.error(err1);
                            }
                        );
                    },
                    (err2: any) => {
                        observer.error(err2);
                    }
                );
            });
        return obs;
    }

    /**
     *
     */
    public static readWavFileAudio(
        path: string,
        startSample: number = undefined,
        endSample: number = undefined
    ): Observable<AudioBuffer> {
        console.log('readWavFileAudio(' + path + ', startSample: ' +
                    startSample + ', endSample: ' + endSample + ')');
        const startByte: number = sampleToByte(startSample),
              endByte: number = sampleToByte(endSample);
        let obs: Observable<AudioBuffer> = Observable.create((observer) => {
            Filesystem.readFromFile(
                this.fileSystem,
                path,
                startByte,
                endByte
            ).subscribe(
                (arrayBuffer: ArrayBuffer) => {
                    // console.log('array buffer: ' + arrayBuffer);
                    // console.log(arrayBuffer.byteLength);
                    // console.dir(arrayBuffer);
                    if (startByte) {
                        // this is a chunk that does not contain a header
                        // we have to create a blob with a wav header, read
                        // the blob with filereader, then decode the result
                        console.log('array buffer: ' + arrayBuffer +
                                    ', byte length: ' + arrayBuffer.byteLength +
                                    ', startByte: ' + startByte +
                                    ', endByte: ' + endByte);
                        // console.log(arrayBuffer.byteLength);
                        // console.dir(arrayBuffer);

                        const fileReader: FileReader = new FileReader();

                        fileReader.onerror = (err1: any) => {
                            observer.error(err1);
                        };

                        fileReader.onload = () => {
                            // For decodeAudioData errs on arrayBuffer, see
                            // https://stackoverflow.com/questions/10365335...
                            //     .../decodeaudiodata-returning-a-null-error
                            AUDIO_CONTEXT.decodeAudioData(
                                fileReader.result
                            ).then(
                                (audioBuffer: AudioBuffer) => {
                                    observer.next(audioBuffer);
                                    observer.complete(audioBuffer);
                                }).catch((err2: any) => {
                                    observer.error(err2);
                                });
                        };

                        fileReader.readAsArrayBuffer(
                            new Blob(
                                [
                                    makeWavBlobHeaderView(
                                        arrayBuffer.byteLength / 2,
                                        SAMPLE_RATE
                                    ),
                                    arrayBuffer
                                ],
                                { type: WAV_MIME_TYPE }
                            )
                        ); // fileReader.readAsArrayBuffer(
                    }
                    else {
                        // this is the entire file, so it has a header,
                        // just decode it
                        AUDIO_CONTEXT.decodeAudioData(arrayBuffer).then(
                            (audioBuffer: AudioBuffer) => {
                                observer.next(audioBuffer);
                                observer.complete(audioBuffer);
                            }).catch((err1: any) => {
                                observer.error(err1);
                            });
                    }
                },
                (err2: any) => {
                    observer.error(err2);
                }
            );
        });
        return obs;
    }

    /**
     *
     */
    public static createWavFile(
        path: string,
        wavData: Int16Array
    ): Observable<void> {
        console.log('createWavFile(' + path + ') - nSamples: ' +
                    wavData.length);
        this.nWavFileSamples = 0;
        let obs: Observable<void> = Observable.create((observer) => {
            const nSamples: number = wavData.length,
                  headerView: DataView = makeWavBlobHeaderView(
                      nSamples,
                      SAMPLE_RATE
                  ),
                  blob: Blob = new Blob(
                      [ headerView, wavData ],
                      { type: WAV_MIME_TYPE }
                  );
            Filesystem.writeToFile(this.fileSystem, path, blob, 0, true)
                .subscribe(
                    () => {
                        this.nWavFileSamples += wavData.length;
                        console.log('writeToFile(' + path + '): nSamples = ' +
                                    this.nWavFileSamples);
                        observer.next();
                        observer.complete();
                    },
                    (err1: any) => {
                        observer.error(err1);
                    }
                );
        });
        return obs;
    }

    /**
     *
     */
    public static appendToWavFile(
        path: string,
        wavData: Int16Array
    ): Observable<void> {
        console.log('appendToWavFile(' + path + ')');
        let obs: Observable<void> = Observable.create((observer) => {
            // see http://soundfile.sapp.org/doc/WaveFormat/ for definitions
            // of subchunk2size and chunkSize
            let fs: FileSystem = this.fileSystem,
                nNewSamples: number = wavData.length,
                nSamples: number = this.nWavFileSamples + nNewSamples,
                subchunk2size: number = 2 * nSamples,
                chunkSize: number = 36 + subchunk2size,
                view: DataView = new DataView(new ArrayBuffer(4)),
                blob: Blob;

            view.setUint32(0, chunkSize, true);
            blob = new Blob(
                [ view ],
                { type: 'application/octet-stream' }
            );
            Filesystem.writeToFile(fs, path, blob, 4, false).subscribe(
                () => {
                    view.setUint32(0, subchunk2size, true);
                    blob = new Blob(
                        [ view ],
                        { type: 'application/octet-stream' }
                    );
                    Filesystem.writeToFile(fs, path, blob, 40, false).subscribe(
                        () => {
                            blob = new Blob(
                                [ wavData ],
                                // { type: 'application/octet-stream' }
                                { type: WAV_MIME_TYPE }
                            );
                            Filesystem.appendToFile(fs, path, blob).subscribe(
                                () => {
                                    console.log('wavData.length = ' +
                                                wavData.length);
                                    this.nWavFileSamples += wavData.length;
                                    observer.next();
                                    observer.complete();
                                },
                                (err1: any) => {
                                    observer.error('err1 ' + err1);
                                }
                            );
                        },
                        (err2: any) => {
                            observer.error('err2 ' + err2);
                        }
                    ); // .writeToFile(fs, path, blob, 40, false) ..
                },
                (err3: any) => {
                    observer.error('err3 ' + err3);
                }
            ); // .writeToFile(fs, path, blob, 4, false).subscribe(
        });
        return obs;

    }
}
