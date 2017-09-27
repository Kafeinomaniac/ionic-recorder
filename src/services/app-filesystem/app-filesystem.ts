// Copyright (c) 2017 Tracktunes Inc

import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
/* tslint:disable */
import { Storage } from '@ionic/storage';
/* tslint:enable */
import { Filesystem } from '../../models';
import { AUDIO_CONTEXT, SAMPLE_RATE } from '../../services/web-audio/common';
import {
    makeWavBlobHeaderView,
    wavSampleToByte
} from '../../models/utils/wav-file';

export interface WavInfo {
    nSamples: number
    sampleRate: number;
}

const REQUEST_SIZE: number = 1024 * 1024 * 1024;
const WAIT_MSEC: number = 50;
const DEFAULT_PATH: string = '/Unfiled/';

/**
 * @class AppFileystem
 */
@Injectable()
export class AppFilesystem {
    public isReady: boolean;
    public entries: Entry[];
    public directoryEntry: DirectoryEntry;
    public selectedPaths: {[path: string]: number};
    private fileSystem: FileSystem;
    private storage: Storage;
    private nWavFileSamples: number;

    /**
     * @constructor
     */
    constructor(storage: Storage) {
        console.log('AppFileystem.constructor()');
        this.storage = storage;
        this.isReady = false;
        this.entries = [];
        this.fileSystem = null;
        this.directoryEntry = null;
        this.selectedPaths = {};
        this.nWavFileSamples = 0;
        // get the filesystem and remember it
        Filesystem.getFileSystem(true, REQUEST_SIZE).subscribe(
            (fileSystem: FileSystem) => {
                // remember the filesystem you got
                this.fileSystem = fileSystem;
                // create the /Unfiled/ directory if not already there
                Filesystem.getPathEntry(
                    fileSystem,
                    '/Unfiled/',
                    true
                ).subscribe(
                    (directoryEntry: DirectoryEntry) => {
                        console.log('Created /Unfiled/ (or already there)');
                        // grab remembered location from storage and go there
                        storage.get('filesystemPath').then(
                            (directoryPath: string) => {
                                if (directoryPath === '//') {
                                    alert('dir path is //');
                                }
                                if (!directoryPath) {
                                    // current path not in storage, use default
                                    directoryPath = DEFAULT_PATH;
                                }
                                // grab selection from storage
                                storage.get('filesystemSelected').then(
                                    // (paths: Set<string>) => {
                                    (paths: {[path: string]: number}) => {
                                        if (paths === null ||
                                            typeof paths === 'undefined') {
                                            this.selectedPaths = {};
                                            this.storage.set(
                                                'filesystemSelected',
                                                this.selectedPaths
                                            );
                                        }
                                        else {
                                            this.selectedPaths = paths;
                                        }
                                        this.switchDirectory(directoryPath)
                                            .subscribe(
                                                () => { this.isReady = true; },
                                                (err1: any) => {
                                                    alert('err1: ' + err1);
                                                }
                                            ); // this.switchDirectory(
                                    }).catch((err2: any) => {
                                        alert('err2: ' + err2);
                                    }); // ).catch((err1: any) => {
                            } // (directoryPath: string) => {
                        ).catch((err3: any) => {
                            alert('err3: ' + err3);
                        }); // ).catch((err3: any) => {
                    }, // (directoryEntry: DirectoryEntry) => {
                    (err4: any) => {
                        alert('err4: ' + err4);
                    }
                ); // .getPathEntry(fileSystem, '/Unfiled/', true).subscribe(
            }, // (fileSystem: FileSystem) => {
            (err5: any) => {
                alert('err5: ' + err5);
            }
        ); // Filesystem.getFileSystem(true, REQUEST_SIZE).subscribe(
    } // constructor() {

    /**
     *
     */
    public getMetadata(fullPath: string): Observable<Metadata> {
        return Filesystem.getMetadata(this.fileSystem, fullPath);
    }

    /**
     *
     */
    public appendToFile(fullPath: string, blob: Blob): Observable<FileEntry> {
        return Filesystem.appendToFile(this.fileSystem, fullPath, blob);
    }

    /**
     *
     */
    public getPath(): string {
        return this.getFullPath(this.directoryEntry);
    }

    /**
     *
     */
    public getSelectedPathsArray(): string[] {
        return Object.keys(this.selectedPaths);
    }

    /**
     *
     */
    public clearSelection(): void {
        for (let key in this.selectedPaths) {
            delete this.selectedPaths[key];
        }
        if (this.selectedPaths !== {}) {
            alert('noway');
        }
        this.storage.set('filesystemSelected', this.selectedPaths);
    }

    /**
     * Wait until file system is ready for use, to emit observable.
     * @returns {Observable<FileSystem>} Observable that emits the file
     * system when it's ready for use.
     */
    public whenReady(): Observable<void> {
        let source: Observable<void> = Observable.create((observer) => {
            let repeat: () => void = () => {
                console.log('AppFileystem.whenReady().repeat()');
                if (this.isReady) {
                    observer.next();
                    observer.complete();
                }
                else {
                    setTimeout(repeat, WAIT_MSEC);
                }
            };
            repeat();
        });
        return source;
    }

    /**
     *
     */
    public getSelectedEntries(): Observable<Entry[]> {
        console.log('AppFileystem.getSelectedEntries()');
        let source: Observable<Entry[]> = Observable.create((observer) => {
            // get the file system
            this.whenReady().subscribe(
                () => {
                    Filesystem.getEntriesFromPaths(
                        this.fileSystem,
                        this.getSelectedPathsArray()
                    ).subscribe(
                        (entries: Entry[]) => {
                            observer.next(entries);
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
        return source;
    }

    /**
     *
     */
    public createDirectory(path: string): Observable<DirectoryEntry> {
        console.log('AppFileystem.createDirectory(' + path + ')');
        let source: Observable<DirectoryEntry> =
            Observable.create((observer) => {
                if (path[path.length - 1] !== '/') {
                    observer.error('path must end with / for createDirectory');
                }
                else {
                    Filesystem.getPathEntry(
                        this.fileSystem,
                        path,
                        true
                    ).subscribe(
                        (directoryEntry: Entry) => {
                            observer.next(directoryEntry);
                            observer.complete();
                        },
                        (err: any) => {
                            observer.error(err);
                        }
                    );
                }
            });
        return source;
    }

    /**
     *
     */
    public refreshDirectory(): Observable<void> {
        let source: Observable<void> = Observable.create((observer) => {
            this.whenReady().subscribe(
                () => {
                    this.switchDirectory(
                        this.getFullPath(this.directoryEntry)
                    ).subscribe(
                        () => {
                            observer.next();
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
        return source;
    }

    /**
     * Wait until file system is ready for use, to emit observable.
     * @returns {Observable<FileSystem>} Observable that emits the file
     * system when it's ready for use.
     */
    public switchDirectory(path: string): Observable<Entry[]> {
        console.log('AppFileystem.switchDirectory(' + path + ')');
        let source: Observable<Entry[]> = Observable.create((observer) => {
            // got file system, now get entry object for path
            // of directory we're switching to
            Filesystem.getPathEntry(this.fileSystem, path, false).subscribe(
                (entry: Entry) => {
                    this.directoryEntry = <DirectoryEntry>entry;
                    // console.log('this.directoryEntry = ' +
                    //             this.directoryEntry.fullPath);
                    // we got the directory entry, now read it
                    Filesystem.readDirectoryEntries(
                            <DirectoryEntry>entry
                    ).subscribe(
                        (entries: Entry[]) => {
                            this.entries = entries;
                            console.log('entries: .........................');
                            console.dir(entries);
                            // store path as last visited too
                            this.storage.set('filesystemPath', path);

                            // return with new entries
                            observer.next(entries);
                            observer.complete();
                        },
                        (err1: any) => {
                            observer.error(err1);
                        }
                    ); // .readDirectoryEntries(directoryEntry).subscribe(
                },
                (err2: any) => {
                    observer.error(err2);
                }
            ); // Filesystem.getPathEntry(fileSystem, path, false).subscribe(
        }); // let source: Observable<Entry[]> = Observable.create((observer)
        return source;
    }

    /**
     * @param {Entry} entry
     */
    public entryIcon(entry: Entry): string {
        return entry.isDirectory ? 'folder' : 'play';
    }

    /**
     * @param {Entry} entry
     */
    public getFullPath(entry: Entry): string {
        const fullPath: string = entry.fullPath;
        return entry.isDirectory && (fullPath.length > 1) ?
            fullPath + '/' : fullPath;
    }

    /**
     * @param {string} path
     */
    public isPathSelected(path: string): boolean {
        return this.selectedPaths.hasOwnProperty(path);
    }

    /**
     * @param {Entry} entry
     */
    public isEntrySelected(entry: Entry): boolean {
        return this.isPathSelected(this.getFullPath(entry));
    }

    /**
     *
     */
    public selectPath(path: string): void {
        console.log('AppFileystem.selectPath(' + path + ')');
        const orderIndex: number = this.nSelected();
        this.selectedPaths[path] = orderIndex;
        this.storage.set('filesystemSelected', this.selectedPaths);
    }

    /**
     * @param {Entry} entry
     */
    public selectEntry(entry: Entry): void {
        this.selectPath(this.getFullPath(entry));
    }

    /**
     *
     */
    public atHome(): boolean {
        // console.log('AppFileystem.atHome(): ' +
        //             (this.directoryEntry.fullPath === '/'));
        return this.directoryEntry.fullPath === '/';
    }

    /**
     *
     */
    public nEntries(): number {
        // console.log('AppFileystem.nEntries(): ' + this.entries.length);
        return this.entries.length;
    }

    /**
     *
     */
    public nSelected(): number {
        // console.log('AppFileystem.nSelected(isReady:' + this.isReady +
        //             '): ' + Object.keys(this.selectedPaths).length);
        return Object.keys(this.selectedPaths).length;
    }

    /**
     *
     */
    public unselectPath(path: string): void {
        console.log('AppFileystem.unselectPath(' + path + ')');
        delete this.selectedPaths[path];

        this.storage.set('filesystemSelected', this.selectedPaths);
    }

    /**
     * @param {Entry} entry
     */
    public unSelectEntry(entry: Entry): void {
        this.unselectPath(this.getFullPath(entry));
    }

    /**
     * @param {Entry} entry
     */
    public toggleSelectEntry(entry: Entry): void {
        const fullPath: string = this.getFullPath(entry);
        console.log('AppFileystem.toggleSelectEntry(' + fullPath + ')');
        if (this.isPathSelected(fullPath)) {
            this.unselectPath(fullPath);
        }
        else {
            this.selectPath(fullPath);
        }
    }

    /**
     * Select all or no items in current folder, depending on 'all; argument
     * @param {boolean} if true, select all, if false, select none
     */
    public selectAllOrNone(bSelectAll: boolean): void {
        console.log('AppFileystem.selectAllOrNoneInFolder(' + bSelectAll + ')');
        let bChanged: boolean = false;
        this.entries.forEach((entry: Entry) => {
            const fullPath: string = this.getFullPath(entry),
                  isSelected: boolean = this.isEntrySelected(entry);
            if (bSelectAll && !isSelected) {
                this.selectPath(fullPath);
                bChanged = true;
            }
            else if (!bSelectAll && isSelected) {
                this.unselectPath(fullPath);
                bChanged = true;
            }
        });
        if (bChanged) {
            this.storage.set('filesystemSelected', this.selectedPaths);
        }
    }

    /**
     * Deletes selected entries.
     */
    public moveSelected(): Observable<void> {
        const paths: string[] = Object.keys(this.selectedPaths).sort();
        console.log('AppFileystem.moveSelected(): ' + paths);
        let source: Observable<void> = Observable.create((observer) => {
            this.whenReady().subscribe(
                () => {
                    Filesystem.moveEntries(
                        this.fileSystem,
                        paths,
                        this.directoryEntry
                    ).subscribe(
                        () => {
                            // TODO: do some error checking before getting here
                            // but also here
                            paths.forEach((path: string) => {
                                this.unselectPath(path);
                            });
                            this.switchDirectory(this.getFullPath(
                                this.directoryEntry
                            )).subscribe(
                                (entries: Entry[]) => {
                                    observer.next();
                                    observer.complete();
                                }
                            );
                        },
                        (err1: any) => {
                            observer.error(err1);
                        } // .deleteEntries(this.fileSystem, paths).subscribe(
                    ); //
                }, // () => {
                (err2: any) => {
                    observer.error(err2);
                }
            ); // this.whenReady().subscribe(
        });
        return source;
    }

    /**
     * Deletes selected entries.
     */
    public deleteSelected(): Observable<void> {
        // sort() is important below for proper deletion order
        const paths: string[] = Object.keys(this.selectedPaths).sort(),
              fullPath: string = this.getFullPath(this.directoryEntry),
              fullPathSize: number = fullPath.length;
        console.log('AppFileystem.deleteSelected(): ' + paths);
        let source: Observable<void> = Observable.create((observer) => {
            // get the file system
            this.whenReady().subscribe(
                () => {
                    Filesystem.deleteEntries(this.fileSystem, paths).subscribe(
                        () => {
                            // unselect removed paths, also track:
                            // if removed path contains current directory,
                            // then switch to root directory
                            let switchHome: boolean = false;
                            paths.forEach((path: string) => {
                                const pathSize: number = path.length;
                                if (fullPathSize >= pathSize &&
                                    fullPath.substring(0, pathSize) === path) {
                                    switchHome = true;
                                }
                                // make sure not tracking selected for deleted
                                // this.selectedPaths.delete(path);
                                this.unselectPath(path);
                            });
                            // store selection in case it has changed
                            this.storage.set('filesystemSelected',
                                             this.selectedPaths);

                            if (switchHome) {
                                this.switchDirectory('/').subscribe(
                                    (entries: Entry[]) => {
                                        observer.next();
                                        observer.complete();
                                    }
                                );
                            }
                            else {
                                // return
                                observer.next();
                                observer.complete();
                            }
                        },
                        (err1: any) => {
                            observer.error(err1);
                        } // .deleteEntries(this.fileSystem, paths).subscribe(
                    ); //
                }, // () => {
                (err2: any) => {
                    observer.error(err2);
                }
            ); // this.whenReady().subscribe(
        });
        return source;
    }

    public readWavFileHeader(path: string): Observable<WavInfo> {
        console.log('AppFileystem.readAudioFromWavFile(' + path + ')');
        let fs: FileSystem = this.fileSystem,
            obs: Observable<WavInfo> = Observable.create((observer) => {
            Filesystem.readFromFile(fs, path, 24, 28).subscribe(
                (data: any) => {
                    const view: DataView = new DataView(data),
                          sampleRate: number = view.getUint32(0, true);
                    Filesystem.readFromFile(fs, path, 40, 44).subscribe(
                        (data: any) => {
                            const view: DataView = new DataView(data),
                                  nSamples: number = view.getUint32(0, true);
                            observer.next({
                                sampleRate: sampleRate,
                                nSamples: nSamples
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
    public readAudioFromWavFile(
        path: string,
        startSample: number = undefined,
        endSample: number = undefined
    ): Observable<AudioBuffer> {
        console.log('AppFileystem.readAudioFromWavFile(' + path + ', ' +
                    startSample + ', ' + endSample + ')');
        const startByte: number = wavSampleToByte(startSample),
              endByte: number = wavSampleToByte(endSample);
        let obs: Observable<AudioBuffer> = Observable.create((observer) => {
            Filesystem.readFromFile(
                this.fileSystem,
                path,
                startByte,
                endByte
            ).subscribe(
                (data: ArrayBuffer) => {
                    AUDIO_CONTEXT.decodeAudioData(
                        data,
                        (audioBuffer: AudioBuffer) => {
                            observer.next(audioBuffer);
                            observer.complete(audioBuffer);
                        },
                        (err1: any) => {
                            observer.error(err1);
                        });
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
    public createWavFile(
        path: string,
        wavData: Int16Array
    ): Observable<void> {
        console.log('AppFileystem.createWavFile(' + path + ')');
        this.nWavFileSamples = 0;
        let source: Observable<void> = Observable.create((observer) => {
            const nSamples: number = wavData.length,
                  headerView: DataView = makeWavBlobHeaderView(
                      nSamples,
                      SAMPLE_RATE
                  ),
                  blob: Blob = new Blob(
                      [ headerView, wavData ],
                      { type: 'audio/wav' }
                  );
            Filesystem.writeToFile(this.fileSystem, path, blob, 0, true)
                .subscribe(
                    () => {
                        this.nWavFileSamples += wavData.length;
                        observer.next();
                        observer.complete();
                    },
                    (err1: any) => {
                        observer.error(err1);
                    }
                );
        });
        return source;
    }

    /**
     *
     */
    public appendToWavFile(
        path: string,
        wavData: Int16Array
    ): Observable<void> {
        console.log('AppFileystem.appendToWavFile(' + path + ')');
        let source: Observable<void> = Observable.create((observer) => {
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
                                { type: 'application/octet-stream' }
                            );
                            Filesystem.appendToFile(fs, path, blob).subscribe(
                                () => {
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
        return source;

    }

}
