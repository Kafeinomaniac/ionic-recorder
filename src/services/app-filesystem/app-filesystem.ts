// Copyright (c) 2017 Tracktunes Inc

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { FS } from '../../models';

const REQUEST_SIZE: number = 1024 * 1024 * 1024;
const WAIT_MSEC: number = 25;

/**
 * @name AppFileSystem
 * @description
 */
@Injectable()
export class AppFS {
    private fileSystem: FileSystem;
    private directoryEntry: DirectoryEntry;

    /**
     * @constructor
     */
    constructor() {
        console.log('AppFS.constructor()');
        this.fileSystem = null;
        this.directoryEntry = null;
        // get the filesystem
        FS.waitForFileSystem(true, REQUEST_SIZE).subscribe(
            (fileSystem: FileSystem) => {
                // remember the filesystem you got
                this.fileSystem = fileSystem;
                // create the /Unfiled/ directory if not already there
                FS.getPathEntry(fileSystem, '/Unfiled/', true).subscribe(
                    (directoryEntry: DirectoryEntry) => {
                        console.log('Created /Unfiled/');
                    },
                    (err1: any) => {
                        alert('Error in AppFS.constructor()! ' + err1);
                    }
                ); // FS.getPathEntry().subscribe(
            }, // (fileSystem: FileSystem) => {
            (err2: any) => {
                alert('Error in AppFS.constructor()! ' + err2);
            }
        ); // FS.waitForFileSystem(true, REQUEST_SIZE).subscribe(
    } // constructor() {

    public atHome(): boolean {
        console.log('AppFS.atHome(): '+
                    (this.directoryEntry && 
                     this.directoryEntry.fullPath === '/'));
        return this.directoryEntry && this.directoryEntry.fullPath === '/';
    }

    /**
     * Wait until file system is ready for use, to emit observable.
     * @returns {Observable<FileSystem>} Observable that emits the file
     * system when it's ready for use.
     */
    public waitForFileSystem(): Observable<FileSystem> {
        console.log('AppFS.getFileSystem()');
        let source: Observable<FileSystem> = Observable.create((observer) => {
            let repeat: () => void = () => {
                console.log('!!!WAIT_FOR_FS!!!');
                if (this.fileSystem) {
                    observer.next(this.fileSystem);
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
     * Wait until file system is ready for use, to emit observable.
     * @returns {Observable<FileSystem>} Observable that emits the file
     * system when it's ready for use.
     */

    public switchDirectory(path: string): Observable<Entry[]> {
        console.log('AppFileSystem.switchDirectory(' + path + ')');
        let source: Observable<Entry[]> = Observable.create((observer) => {
            // get the file system
            this.waitForFileSystem().subscribe(
                (fileSystem: FileSystem) => {
                    // got file system, now get entry object for path
                    // of directory we're switching to
                    FS.getPathEntry(fileSystem, path, bCreate).subscribe(
                        (directoryEntry: Entry) => {
                            this.directoryEntry = directoryEntry;
                            // we got the directory entry, now read it
                            FS.readDirectory(directoryEntry).subscribe(
                                (entries: Entry[]) => {
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
                    ); // FS.getPathEntry(fileSystem, path, bCreate).subscribe(
                },
                (err3: any) => {
                    observer.error(err3);
                }
            ); // this.waitForFileSystem().subscribe(
        }); // let source: Observable<void> = Observable.create((observer) => {
        return source;
    }

    /**
     * Removes entries, supplied as an array of full path strings,
     * sequentially.
     * @param {string[]} paths 
     */
    public removeEntries(paths: string[]): Observable<void> {
        console.log('AppFS.removeEntries(' + paths + ')');
        let source: Observable<void> = Observable.create((observer) => {
            // get the file system
            this.waitForFileSystem().subscribe(
                (fileSystem: FileSystem) => {
                    FS.removeEntries(fileSystem, paths).subscribe(
                        () => {
                            observer.next();
                            observer.complete();
                        },
                        (err1: any) => {
                            observer.error(err1);
                        } // FS.removeEntries(fileSystem, paths).subscribe(
                    ); // 
                }, // (fileSystem: FileSystem) => {
                (err2: any) => {
                    observer.error(err2);
                }
            ); // this.waitForFileSystem().subscribe(

        });
        return source;
    }
}
