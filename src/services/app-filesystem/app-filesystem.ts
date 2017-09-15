// Copyright (c) 2017 Tracktunes Inc

import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { FS, isUndefined } from '../../models';

const REQUEST_SIZE: number = 1024 * 1024 * 1024;
const WAIT_MSEC: number = 25;

// storage keys
const PATH_KEY: string = 'directoryPath';
const SELECTED_KEY: string = 'selectedPaths';

/**
 * @name AppFS
 * @description
 */
@Injectable()
export class AppFS {
    public isReady: boolean;
    public entries: Entry[];
    public directoryEntry: DirectoryEntry;
    public selectedPaths: Set<string>;

    private fileSystem: FileSystem;
    private storage: Storage;

    /**
     * @constructor
     */
    constructor(storage: Storage) {
        console.log('AppFS.constructor()');
        this.storage = storage;
        this.isReady = false;
        this.entries = [];
        this.fileSystem = null;
        this.directoryEntry = null;
        this.selectedPaths = new Set<string>();

        // get the filesystem and remember it
        FS.getFileSystem(true, REQUEST_SIZE).subscribe(
            (fileSystem: FileSystem) => {
                // remember the filesystem you got
                this.fileSystem = fileSystem;
                // create the /Unfiled/ directory if not already there
                FS.getPathEntry(fileSystem, '/Unfiled/', true).subscribe(
                    (directoryEntry: DirectoryEntry) => {
                        console.log('Created /Unfiled/ (or already there)');
                        // grab remembered location from storage and go there
                        this.storage.get(PATH_KEY).then(
                            (directoryPath: string) => {
                                if (!directoryPath) {
                                    // it was not in storage, go to root
                                    directoryPath = '/';
                                }
                                // grab selection from storage
                                this.storage.get(SELECTED_KEY).then(
                                    (paths: Set<string>) => {
                                        if (paths) {
                                            this.selectedPaths = paths;
                                        }
                                        // finally signal we're ready
                                        console.log('AppFS.isReady == true');
                                        // before switchDirectory avoid looping
                                        this.switchDirectory(directoryPath)
                                            .subscribe(
                                                () => {
                                                    this.isReady = true;
                                                },
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
                ); // FS.getPathEntry(fileSystem, '/Unfiled/', true).subscribe(
            }, // (fileSystem: FileSystem) => {
            (err5: any) => {
                alert('err5: ' + err5);
            }
        ); // FS.getFileSystem(true, REQUEST_SIZE).subscribe(
    } // constructor() {

    public getPath(): string {
        return this.getFullPath(this.directoryEntry);
    }

    public getSelectedPathsArray(): string[] {
        return Array.from(this.selectedPaths);
    }

    public clearSelection(): void {
        this.selectedPaths.clear();
        this.storage.set(SELECTED_KEY, this.selectedPaths);
    }

    /**
     * Wait until file system is ready for use, to emit observable.
     * @returns {Observable<FileSystem>} Observable that emits the file
     * system when it's ready for use.
     */
    public whenReady(): Observable<void> {
        let source: Observable<void> = Observable.create((observer) => {
            let repeat: () => void = () => {
                console.log('AppFS.whenReady().repeat()');
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

    public getSelectedEntries(): Observable<Entry[]> {
        console.log('AppFS.getSelectedEntries()');
        let source: Observable<Entry[]> = Observable.create((observer) => {
            // get the file system
            this.whenReady().subscribe(
                () => {
                    FS.getEntriesFromPaths(
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


    public createDirectory(path: string): Observable<DirectoryEntry> {
        let source: Observable<DirectoryEntry> =
            Observable.create((observer) => {
                if (path[path.length - 1] !== '/') {
                    observer.error('path must end with / for createDirectory');
                }
                else {
                    FS.getPathEntry(this.fileSystem, path, true).subscribe(
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
     * Wait until file system is ready for use, to emit observable.
     * @returns {Observable<FileSystem>} Observable that emits the file
     * system when it's ready for use.
     */
    public switchDirectory(path: string): Observable<Entry[]> {
        console.log('AppFS.switchDirectory(' + path + ')');
        let source: Observable<Entry[]> = Observable.create((observer) => {
            // got file system, now get entry object for path
            // of directory we're switching to
            FS.getPathEntry(this.fileSystem, path, false).subscribe(
                (entry: Entry) => {
                    this.directoryEntry = <DirectoryEntry>entry;
                    console.log('this.directoryEntry = ' +
                                this.directoryEntry.fullPath);
                    // we got the directory entry, now read it
                    FS.readDirectory(<DirectoryEntry>entry).subscribe(
                        (entries: Entry[]) => {
                            this.entries = entries;
                            console.log('entries: .........................');
                            console.dir(entries);
                            // store path as last visited too
                            this.storage.set(PATH_KEY, path);
                            // return with new entries
                            observer.next(entries);
                            observer.complete();
                        },
                        (err1: any) => {
                            observer.error(err1);
                        }
                    ); // FS.readDirectory(directoryEntry).subscribe(
                },
                (err2: any) => {
                    observer.error(err2);
                }
            ); // FS.getPathEntry(fileSystem, path, false).subscribe(
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
        // console.log('isPathSelected(' + path + '): ' +
        //             this.selectedPaths.has(path));
        return this.selectedPaths.has(path);
    }

    /**
     * @param {Entry} entry
     */
    public isEntrySelected(entry: Entry): boolean {
        return this.isPathSelected(this.getFullPath(entry));
    }

    public selectPath(path: string): void {
        console.log('selectPath(' + path + ')');
        this.selectedPaths.add(path);
        this.storage.set(SELECTED_KEY, this.selectedPaths);
    }

    /**
     * @param {Entry} entry
     */
    public selectEntry(entry: Entry): void {
        this.selectPath(this.getFullPath(entry));
    }

    public unselectPath(path: string): void {
        console.log('unselectPath(' + path + ')');
        this.selectedPaths.delete(path);
        this.storage.set(SELECTED_KEY, this.selectedPaths);
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
        if (this.selectedPaths.has(fullPath)) {
            this.selectedPaths.delete(fullPath);
        }
        else {
            this.selectedPaths.add(fullPath);
        }
        this.storage.set(SELECTED_KEY, this.selectedPaths);
        console.dir(this.selectedPaths);
    }

    /**
     * Select all or no items in current folder, depending on 'all; argument
     * @param {boolean} if true, select all, if false, select none
     * @returns {void}
     */
    public selectAllOrNone(bSelectAll: boolean): void {
        console.log('selectAllOrNoneInFolder(' + bSelectAll + ')');
        let bChanged: boolean = false;
        this.entries.forEach((entry: Entry) => {
            const fullPath: string = this.getFullPath(entry),
                  isSelected: boolean = this.isEntrySelected(entry);
            if (bSelectAll && !isSelected) {
                this.selectedPaths.add(fullPath);
                bChanged = true;
            }
            else if (!bSelectAll && isSelected) {
                this.selectedPaths.delete(fullPath);
                bChanged = true;
            }
        });
        if (bChanged) {
            this.storage.set(SELECTED_KEY, this.selectedPaths);
        }
    }

    /**
     * Removes entries, supplied as an array of full path strings,
     * sequentially.
     * @param {string[]} paths
     */
    public deleteEntries(paths: string[]): Observable<void> {
        console.log('AppFS.deleteEntries(' + paths + ')');
        const fullPath: string = this.getFullPath(this.directoryEntry),
              fullPathSize: number = fullPath.length;
        let source: Observable<void> = Observable.create((observer) => {
            // get the file system
            this.whenReady().subscribe(
                () => {
                    FS.deleteEntries(this.fileSystem, paths).subscribe(
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
                                this.selectedPaths.delete(path);
                            });

                            // store selection in case it has changed
                            this.storage.set(SELECTED_KEY, this.selectedPaths);

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
                        } // FS.deleteEntries(this.fileSystem, paths).subscribe(
                    ); //
                }, // () => {
                (err2: any) => {
                    observer.error(err2);
                }
            ); // this.whenReady().subscribe(

        });
        return source;
    }
}
