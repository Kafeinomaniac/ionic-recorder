// Copyright (c) 2017 Tracktunes Inc

import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
/* tslint:disable */
import { Storage } from '@ionic/storage';
/* tslint:enable */
import { Filesystem, has } from '../../models';

const WAIT_MSEC: number = 60;
const DEFAULT_PATH: string = '/Unfiled/';

/**
 * @class AppFileystem
 */
@Injectable()
export class AppFilesystem {
    private storage: Storage;
    public isReady: boolean;
    public entries: Entry[];
    public folderEntry: DirectoryEntry;
    public selectedPaths: { [path: string]: number };
    private fileSystem: FileSystem;
    private nWavFileSamples: number;

    /**
     * @constructor
     */
    // constructor(storage: Storage) {
    constructor() {
        console.log('constructor()');

        // this.storage = storage;
        this.storage = new Storage({});
        this.isReady = false;
        this.entries = [];
        this.folderEntry = null;
        this.selectedPaths = {};
        this.fileSystem = null;
        this.nWavFileSamples = 0;

        this.setUpFileSystem();
    }

    /**
     *
     */
    private setUpFileSystem(): void {
        // get the filesystem and remember it
        Filesystem.getFileSystem(true).subscribe(
            (fs: FileSystem) => {
                // remember the filesystem you got
                this.fileSystem = fs;
                // create the /Unfiled/ folder if not already there
                Filesystem.getPathEntry(fs, '/Unfiled/', true).subscribe(
                    (folderEntry: DirectoryEntry) => {
                        console.log('Created /Unfiled/ (or already there)');
                        // grab remembered location from storage and go there
                        if (!this.storage) {
                            alert('!this.storage');
                        }
                        this.storage.get('filesystemPath').then(
                            (folderPath: string) => {
                                if (folderPath === '//') {
                                    alert('dir path is //');
                                }
                                if (!folderPath) {
                                    // current path not in storage, use default
                                    folderPath = DEFAULT_PATH;
                                }
                                // grab selection from storage
                                this.storage.get('filesystemSelected').then(
                                    // (paths: Set<string>) => {
                                    (paths: {
                                        [path: string]: number }) => {
                                            if (paths) {
                                                this.selectedPaths = paths;
                                            }
                                            else {
                                                this.selectedPaths = {};
                                                this.storage.set(
                                                    'filesystemSelected',
                                                    this.selectedPaths
                                                );
                                            }
                                            this.switchFolder(folderPath)
                                                .subscribe(
                                                    () => {
                                                        this.isReady = true;
                                                    },
                                                    (err0: any) => {
                                                        // err - try switching
                                                        // to /Unfiled/ instead
                                                        this.switchFolder(
                                                            '/Unfiled/'
                                                        ).subscribe(
                                                            () => {
                                                                this.isReady =
                                                                    true;
                                                            },
                                                            (err1: any) => {
                                                                alert('err0:' +
                                                                      err0 +
                                                                      'err1:' +
                                                                      err1);
                                                            }
                                                        );
                                                    }

                                                ); // this.switchFolder(
                                        }
                                ).catch((err2: any) => {
                                    alert('err2: ' + err2);
                                }); // .then(..).catch((err2: any) => {..
                            } // (folderPath: string) => {
                        ).catch((err3: any) => {
                            alert('* err3: ' + err3);
                        }); // .then(..).catch((err3: any) => {
                    }, // (folderEntry: DirectoryEntry) => {
                    (err4: any) => {
                        alert('err4: ' + err4);
                    }
                ); // getPathEntry(fileSystem, '/Unfiled/', true).subs..
            },
            (err5: any) => {
                alert('err5: ' + err5);
            }
        );
    }

    /**
     *
     */
    public getFilesystem(): FileSystem {
        return this.fileSystem;
    }

    /**
     *
     */
    /*
    public getMetadata(fullPath: string): Observable<Metadata> {
        return Filesystem.getMetadata(this.fileSystem, fullPath);
    }
    */

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
        return this.getFullPath(this.folderEntry);
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
        let obs: Observable<void> = Observable.create((observer) => {
            const repeat: () => void = () => {
                console.log('repeat()');
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
        return obs;
    }

    /**
     *
     */
    public getSelectedEntries(): Observable <Entry[]> {
        console.log('getSelectedEntries()');
        let obs: Observable <Entry[]> = Observable.create((observer) => {
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
        return obs;
    }

    /**
     *
     */
    public createFolder(path: string): Observable<DirectoryEntry> {
        console.log('createFolder(' + path + ')');
        let obs: Observable<DirectoryEntry> =
            Observable.create((observer) => {
                if (path[path.length - 1] !== '/') {
                    observer.error('path must end with / for createFolder');
                }
                else {
                    Filesystem.getPathEntry(
                        this.fileSystem,
                        path,
                        true
                    ).subscribe(
                        (folderEntry: Entry) => {
                            observer.next(folderEntry);
                            observer.complete();
                        },
                        (err: any) => {
                            observer.error(err);
                        }
                    );
                }
            });
        return obs;
    }

    /**
     *
     */
    public refreshFolder(): Observable<void> {
        let obs: Observable<void> = Observable.create((observer) => {
            this.whenReady().subscribe(
                () => {
                    this.switchFolder(
                        this.getFullPath(this.folderEntry)
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
        return obs;
    }

    /**
     * Wait until file system is ready for use, to emit observable.
     * @returns {Observable<FileSystem>} Observable that emits the file
     * system when it's ready for use.
     */
    public switchFolder(path: string): Observable <Entry[]> {
        console.log('switchFolder(' + path + ')');
        let obs: Observable <Entry[]> = Observable.create((observer) => {
            // got file system, now get entry object for path
            // of folder we're switching to
            Filesystem.getPathEntry(this.fileSystem, path, false).subscribe(
                (entry: Entry) => {
                    this.folderEntry = <DirectoryEntry>entry;
                    // console.log('this.folderEntry = ' +
                    //             this.folderEntry.fullPath);
                    // we got the folder entry, now read it
                    Filesystem.readFolderEntries(
                            <DirectoryEntry>entry
                    ).subscribe(
                        (entries: Entry[]) => {
                            this.entries = entries;
                            // store path as last visited too
                            this.storage.set('filesystemPath', path);

                            // return with new entries
                            observer.next(entries);
                            observer.complete();
                        },
                        (err1: any) => {
                            observer.error(err1);
                        }
                    ); // .readFolderEntries(folderEntry).subscribe(
                },
                (err2: any) => {
                    observer.error(err2);
                }
            ); // Filesystem.getPathEntry(fileSystem, path, false).subscribe(
        }); // let obs: Observable<Entry[]> = Observable.create((observer)
        return obs;
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
        // return this.selectedPaths.hasOwnProperty(path);
        return has(this.selectedPaths, path);
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
        console.log('selectPath(' + path + ')');
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
        // console.log('atHome(): ' +
        //             (this.folderEntry.fullPath === '/'));
        return this.folderEntry.fullPath === '/';
    }

    /**
     *
     */
    public nEntries(): number {
        // console.log('nEntries(): ' + this.entries.length);
        return this.entries.length;
    }

    /**
     *
     */
    public nSelected(): number {
        // console.log('nSelected(isReady:' + this.isReady +
        //             '): ' + Object.keys(this.selectedPaths).length);
        return Object.keys(this.selectedPaths).length;
    }

    /**
     *
     */
    public unselectPath(fullPath: string): void {
        console.log('unselectPath(' + fullPath + ')');
        delete this.selectedPaths[fullPath];
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
        console.log('toggleSelectEntry(' + fullPath + ')');
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
        console.log('selectAllOrNoneInFolder(' + bSelectAll + ')');
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
        console.log('moveSelected(): ' + paths);
        let obs: Observable<void> = Observable.create((observer) => {
            this.whenReady().subscribe(
                () => {
                    Filesystem.moveEntries(
                        this.fileSystem,
                        paths,
                        this.folderEntry
                    ).subscribe(
                        () => {
                            // TODO: do some error checking before getting here
                            // but also here
                            paths.forEach((path: string) => {
                                this.unselectPath(path);
                            });
                            this.switchFolder(this.getFullPath(
                                this.folderEntry
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
        return obs;
    }

    /**
     * Deletes selected entries.
     */
    public deleteSelected(): Observable<void> {
        // sort() is important below for proper deletion order
        const paths: string[] = Object.keys(this.selectedPaths).sort(),
              fullPath: string = this.getFullPath(this.folderEntry),
              fullPathSize: number = fullPath.length;
        console.log('deleteSelected(): ' + paths);
        let obs: Observable<void> = Observable.create((observer) => {
            // get the file system
            this.whenReady().subscribe(
                () => {
                    Filesystem.deleteEntries(this.fileSystem, paths).subscribe(
                        () => {
                            // unselect removed paths, also track:
                            // if removed path contains current folder,
                            // then switch to root folder
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
                                this.switchFolder('/').subscribe(
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
        return obs;
    }

}
