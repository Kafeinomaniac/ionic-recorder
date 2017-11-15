// Copyright (c) 2017 Tracktunes Inc

import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
/* tslint:disable */
import { Storage } from '@ionic/storage';
/* tslint:enable */
import { Filesystem, has } from '../../models';

/** @const {string} - the default save path */
export const DEFAULT_PATH: string = '/Unfiled/';

const WAIT_MSEC: number = 60;

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

    /**
     * @constructor
     */
    constructor() {
        console.log('constructor()');

        this.storage = new Storage({});
        this.isReady = false;
        this.entries = [];
        this.folderEntry = null;
        this.selectedPaths = {};
        this.fileSystem = null;

        this.setUpFileSystem();
    }

    /**
     * @param {selectedPaths: {[path: string]: number}}
     * @returns void
     */
    public saveSelectedPaths(
        selectedPaths: { [path: string]: number } = null
    ): void {
        if (selectedPaths !== null) {
            this.selectedPaths = selectedPaths;
        }
        this.storage.set('filesystemSelected', this.selectedPaths);
    }

    /**
     * @returns void
     */
    public setUpFileSystem(): void {
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
                            throw Error('!this.storage!');
                        }
                        this.storage.get('filesystemPath').then(
                            (folderPath: string) => {
                                if (folderPath === '//') {
                                    throw Error('dir path is //');
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
                                                this.saveSelectedPaths({});
                                            }
                                            this.switchFolder(folderPath)
                                                .subscribe(
                                                    () => {
                                                        this.isReady = true;
                                                    },
                                                    (err1: any) => {
                                                        throw Error(err1);
                                                    }
                                                ); // this.switchFolder( ..
                                        }
                                ).catch((err2: any) => {
                                    throw Error(err2);
                                }); // this.storage.get('filesystemSelected') ..
                            }
                        ).catch((err3: any) => {
                            throw Error(err3);
                        }); // this.storage.get('filesystemPath') ..
                    },
                    (err4: any) => {
                        throw Error(err4);
                    }
                ); // getPathEntry(fileSystem, '/Unfiled/', true) ..
            },
            (err5: any) => {
                throw Error(err5);
            }
        ); // Filesystem.getFileSystem(true).subscribe( ..
    }

    /**
     * @returns Observable<void>
     */
    public downloadFileToDevice(filePath: string): Observable<void> {
        console.log('downloadFileToDevice(' + filePath + ')');
        return Filesystem.downloadFileToDevice(
            this.fileSystem,
            filePath
        );
    }

    /**
     * @returns FileSystem
     */
    public getFilesystem(): FileSystem {
        return this.fileSystem;
    }

    /**
     * @returns Metadata
     */
    public getMetadata(fullPath: string): Observable<Metadata> {
        return Filesystem.getMetadata(this.fileSystem, fullPath);
    }

    /**
     * @returns Observable<FileEntry>
     */
    public appendToFile(fullPath: string, blob: Blob): Observable<FileEntry> {
        return Filesystem.appendToFile(this.fileSystem, fullPath, blob);
    }

    /**
     * @returns string
     */
    public getPath(): string {
        return this.getFullPath(this.folderEntry);
    }

    /**
     * @returns string[]
     */
    public getSelectedPathsArray(): string[] {
        return Object.keys(this.selectedPaths);
    }

    /**
     * @returns void
     */
    public clearSelection(): void {
        for (let key in this.selectedPaths) {
            delete this.selectedPaths[key];
        }
        if (Object.keys(this.selectedPaths).length !== 0) {
            throw Error('Expected nothing to be selected but ' +
                        (Object.keys(this.selectedPaths).length) + ' are!');
        }
        this.storage.set('filesystemSelected', {});
    }

    /**
     * Wait until file system is ready for use, to emit observable.
     * @returns Observable<FileSystem> Observable that emits the file
     * system when it's ready for use.
     */
    public whenReady(): Observable<void> {
        const obs: Observable<void> = Observable.create((observer) => {
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
     * @returns Observable <Entry[]>
     */
    public getSelectedEntries(): Observable <Entry[]> {
        console.log('getSelectedEntries()');
        const obs: Observable <Entry[]> = Observable.create((observer) => {
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
     * @returns Observable<DirectoryEntry>
     */
    public createFolder(path: string): Observable<DirectoryEntry> {
        console.log('createFolder(' + path + ')');
        const obs: Observable<DirectoryEntry> =
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
     * @returns Observable<void>
     */
    public refreshFolder(): Observable<void> {
        const obs: Observable<void> = Observable.create((observer) => {
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
     * @returns Observable<FileSystem> Observable that emits the file
     * system when it's ready for use.
     */
    public switchFolder(path: string): Observable <Entry[]> {
        console.log('switchFolder(' + path + ')');
        const obs: Observable <Entry[]> = Observable.create((observer) => {
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
        }); // const obs: Observable<Entry[]> = Observable.create((observer)
        return obs;
    }

    /**
     * @param {Entry} entry
     * @returns string
     */
    public entryIcon(entry: Entry): string {
        return entry.isDirectory ? 'folder' : 'play';
    }

    /**
     * @param {Entry} entry
     * @returns string
     */
    public getFullPath(entry: Entry): string {
        const fullPath: string = entry.fullPath;
        return entry.isDirectory && (fullPath.length > 1) ?
            fullPath + '/' : fullPath;
    }

    /**
     * @param {string} path
     * @returns boolean
     */
    public isPathSelected(path: string): boolean {
        // return this.selectedPaths.hasOwnProperty(path);
        return has(this.selectedPaths, path);
    }

    /**
     * @param {Entry} entry
     * @returns boolean
     */
    public isEntrySelected(entry: Entry): boolean {
        return this.isPathSelected(this.getFullPath(entry));
    }

    /**
     * Get the number indicating order
     * @param {string} entryPath
     * @returns number
     */
    public getOrderIndex(path: string): number {
        const len: number = path.length,
              lenM1: number = len - 1;
        if (len > 1 && path[lenM1] === '/') {
            path = path.substr(0, len - 1);
        }
        let result: number = -1;
        this.entries.find(
            (entry, index) => {
                if (entry.fullPath === path) {
                    result = index;
                    return true;
                }
                else {
                    return false;
                }
            }
        );
        console.log('getOrderIndex(' + path + ') -> ' + result);
        return result;
    }

    /**
     * @param {string} path
     * @returns void
     */
    public selectPath(path: string): void {
        // const orderIndex: number = this.nSelected();
        const orderIndex: number = this.getOrderIndex(path);
        console.log('selectPath(' + path + '): ' + orderIndex);
        this.selectedPaths[path] = orderIndex;
        this.storage.set('filesystemSelected', this.selectedPaths);
    }

    /**
     * @param {Entry} entry
     * @returns void
     */
    public selectEntry(entry: Entry): void {
        this.selectPath(this.getFullPath(entry));
    }

    /**
     * @returns boolean
     */
    public atHome(): boolean {
        // console.log('atHome(): ' +
        //             (this.folderEntry.fullPath === '/'));
        return this.folderEntry.fullPath === '/';
    }

    /**
     * @returns number
     */
    public nEntries(): number {
        // console.log('nEntries(): ' + this.entries.length);
        return this.entries.length;
    }

    /**
     * @returns number
     */
    public nSelected(): number {
        // console.log('nSelected(isReady:' + this.isReady +
        //             '): ' + Object.keys(this.selectedPaths).length);
        return Object.keys(this.selectedPaths).length;
    }

    /**
     * @param {string} path
     * @returns void
     */
    public unselectPath(path: string): void {
        console.log('unselectPath(' + path + ')');
        delete this.selectedPaths[path];
        this.storage.set('filesystemSelected', this.selectedPaths);
    }

    /**
     * @param {Entry} entry
     * @returns void
     */
    public unSelectEntry(entry: Entry): void {
        this.unselectPath(this.getFullPath(entry));
    }

    /**
     * @param {Entry} entry
     * @returns void
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
     * @returns void
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
     * Moves selected entries to current folder (here).
     * @param {string[]} paths
     * @returns Observable<void>
     */
    public movePaths(paths: string[]): Observable<void> {
        console.log('movePaths(): ' + paths);
        const obs: Observable<void> = Observable.create((observer) => {
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
                        }
                    );
                },
                (err2: any) => {
                    observer.error(err2);
                }
            ); // this.whenReady().subscribe(
        });
        return obs;
    }

    /**
     * Moves selected entries to current folder (here).
     * @returns Observable<void>
     */
    public moveSelected(): Observable<void> {
        console.log('moveSelected()');
        // call to sort() below reduces file not found errors
        return this.movePaths(Object.keys(this.selectedPaths).sort());
    }

    /**
     * Deletes selected entries.
     * @returns Observable<void>
     */
    public deleteSelected(): Observable<void> {
        const obs: Observable<void> = Observable.create((observer) => {
            // get the file system
            this.whenReady().subscribe(
                () => {
                    // sort() is important below for proper deletion order
                    const paths: string[] =
                          Object.keys(this.selectedPaths).sort(),
                          fullPath: string =
                          this.getFullPath(this.folderEntry),
                          fullPathSize: number = fullPath.length;
                    console.log('deleteSelected([' + paths.join(', ') + '])');

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
                            const refreshFolder: string = switchHome ? '/'
                                  : this.getFullPath(this.folderEntry);

                            this.switchFolder(refreshFolder).subscribe(
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
                        } // .deleteEntries(this.fileSystem, paths).subscribe(
                    ); //
                }, // () => {
                (err3: any) => {
                    observer.error(err3);
                }
            ); // this.whenReady().subscribe(
        });
        return obs;
    }

    /**
     * Deletes a collection of files.
     * @param {string[]} paths
     * @returns Observable<void>
     */
    public deletePaths(paths: string[]): Observable<void> {
        const obs: Observable<void> = Observable.create((observer) => {
            this.whenReady().subscribe(
                () => {
                    Filesystem.deleteEntries(this.fileSystem, paths).subscribe(
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
     * Renames either a file or a directory.
     * @param {string} fullPath - full path of the entry to rename, if
     * the last char of this path is a forward slash (/) then this is a
     * folder and we must always end folders with a slash when specified.
     * If not ending with a slash, it is a file.
     * trailing slash  directories (folders).
     * @param {string} newName - renames to this.
     * @returns Observable<void>
     */
    public rename(fullPath: string, newName: string): Observable<void> {
        console.log('rename(' + fullPath + ', ' + newName + ')');
        const obs: Observable<void> = Observable.create((observer) => {
            if (fullPath[fullPath.length - 1] === '/') {
                console.log('ITS A FOLDER');
                this.fileSystem.root.getDirectory(
                    fullPath,
                    { create: false },
                    (entry: Entry) => {
                        console.log('rename(): got: ' + entry.name);
                        entry.moveTo(this.folderEntry, newName);
                        this.switchFolder(
                            this.getFullPath(this.folderEntry)
                        ).subscribe(
                            () => {
                                observer.next();
                                observer.complete();
                            },
                            (err1: any) => {
                                observer.error('err1 ' + err1);
                            }
                        );
                    },
                    (err2: any) => {
                        observer.error(err2);
                    }
                );

            }
            else {
                console.log('ITS A FILE');
                this.fileSystem.root.getFile(
                    fullPath,
                    { create: false },
                    (entry: Entry) => {
                        console.log('rename(): got: ' + entry.name);
                        entry.moveTo(this.folderEntry, newName);
                        this.switchFolder(
                            this.getFullPath(this.folderEntry)
                        ).subscribe(
                            () => {
                                observer.next();
                                observer.complete();
                            },
                            (err1: any) => {
                                observer.error('err1 ' + err1);
                            }
                        );
                    },
                    (err2: any) => {
                        observer.error(err2);
                    }
                );

            }
        });
        return obs;
    }
}
