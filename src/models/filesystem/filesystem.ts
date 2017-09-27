import { Observable } from 'rxjs/Rx';

export class Filesystem {
    /**
     *
     */
    public static getEntriesFromPaths(
        fileSystem: FileSystem,
        paths: string[]
    ): Observable<Entry[]> {
        console.log('Filesystem.getEntriesFromPaths(fs, ' + paths + ')');
        let entryObservableArray: Observable<Entry>[] =
            paths.map((path: string) => {
                return Filesystem.getPathEntry(fileSystem, path, false);
            }),
            result: Entry[] = [],
            obs: Observable<Entry[]> = Observable.create((observer) => {
                Observable.from(entryObservableArray).concatAll().subscribe(
                    (entry: Entry) => {
                        result.push(entry);
                    },
                    (err: any) => {
                        observer.error(err);
                    },
                    () => {
                        observer.next(result);
                        observer.complete();
                    }
                );
            });
        return obs;
    }

    /**
     *
     */
    public static deleteEntries(
        fileSystem: FileSystem,
        paths: string[]
    ): Observable<void> {
        console.log('Filesystem.deleteEntries(fs, ' + paths + ')');
        let entryObservableArray: Observable<Entry>[] =
            paths.map((path: string) => {
                return Filesystem.getPathEntry(fileSystem, path, false);
            }),
            obs: Observable<void> = Observable.create((observer) => {
                Observable.from(entryObservableArray).concatAll().subscribe(
                    (entry: Entry) => {
                        Filesystem.deleteEntry(entry).subscribe(
                            null,
                            (err1: any) => {
                                observer.error('err1: ' + err1);
                            }
                        );
                    },
                    (err2: any) => {
                        observer.error(err2);
                    },
                    () => {
                        observer.next();
                        observer.complete();
                    }
                );
            });
        return obs;
    }

    /**
     *
     */
    public static moveEntries(
        fileSystem: FileSystem,
        paths: string[],
        parent: DirectoryEntry
    ): Observable<void> {
        console.log('Filesystem.moveEntries(fs, ' + paths + ',' +
                    parent.name + ')');
        let entryObservableArray: Observable<Entry>[] =
            paths.map((path: string) => {
                return Filesystem.getPathEntry(fileSystem, path, false);
            }),
            obs: Observable<void> = Observable.create((observer) => {
                Observable.from(entryObservableArray).concatAll().subscribe(
                    (entry: Entry) => {
                        Filesystem.moveEntry(entry, parent).subscribe(
                            null,
                            (err1: any) => {
                                observer.error('err1: ' + err1);
                            }
                        );
                    },
                    (err2: any) => {
                        observer.error(err2);
                    },
                    () => {
                        observer.next();
                        observer.complete();
                    }
                );
            });
        return obs;
    }

    /**
     *
     */
    public static moveEntry(
        entry: Entry,
        parent: DirectoryEntry
    ): Observable<void> {
        let obs: Observable<void> = Observable.create((observer) => {
            const successCB: (ent: Entry) => void = (ent: Entry) => {
                console.log('Filesystem.moveEntry.successCB()');
                observer.next();
                observer.complete();
            };
            const errorCB: (error: FileError) => void = (error: FileError) => {
                console.log('Filesystem.moveEntry.errorCB()');
                observer.error(error);
            };
            entry.moveTo(parent, entry.name, successCB, errorCB);
        });
        return obs;
    }

    /**
     *
     */
    public static deleteEntry(entry: Entry): Observable<void> {
        console.log('Filesystem.deleteEntry(' + entry.fullPath + ')');
        let obs: Observable<void> = Observable.create((observer) => {
            if (entry.isFile) {
                entry.remove(
                    () => {
                        console.log('Filesystem.deleteEntry(): Done removing ' +
                                    entry.fullPath);
                        observer.next();
                        observer.complete();
                    },
                    (err: FileError) => {
                        console.log('remove file error: ' + err);
                        observer.error(err);
                    }
                );
            }
            else if (entry.isDirectory) {
                (<DirectoryEntry>entry).removeRecursively(
                    () => {
                        console.log('Filesystem.deleteEntry(): Done removing ' +
                                    entry.fullPath);
                        observer.next();
                        observer.complete();
                    },
                    (err: FileError) => {
                        console.log('remove dir error: ' + err);
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
    public static getPathEntry(
        fileSystem: FileSystem,
        path: string,
        bCreate: boolean = false
    ): Observable<Entry> {
        console.log('Filesystem.getPathEntry(fs, ' + path + ', ' +
                    bCreate + ')');
        let obs: Observable<Entry> = Observable.create((observer) => {
            if (path === '/') {
                observer.next(fileSystem.root);
                observer.complete();
            }
            else if (path[path.length - 1] === '/') {
                // it's a directory
                fileSystem.root.getDirectory(
                    path,
                    { create: bCreate },
                    (directoryEntry: DirectoryEntry) => {
                        observer.next(directoryEntry);
                        observer.complete();
                    },
                    (err: any) => {
                        console.log('Filesystem.getPathEntry(.., ' + path +
                                    ') error1: ' + err);
                        observer.error(err);
                    }
                );
            } // if (path[path.length - 1] === '/') {
            else {
                // it's a file
                console.log('fileSystem.root.getFile(' + path + ', ' +
                            bCreate + ')');
                fileSystem.root.getFile(
                    path,
                    { create: bCreate },
                    (fileEntry: FileEntry) => {
                        observer.next(fileEntry);
                        observer.complete();
                    },
                    (err: any) => {
                        console.log('getPathEntry error2: ' + err +
                                    ' - it wrongly thinks path:' + path +
                                    ' is a file!');
                        observer.error(err);
                    }
                );
            } // if (path[path.length - 1] === '/') { .. else { ..}
        });
        return obs;
    }

    /**
     *
     */
    public static getFileSystem(
        bPersistent: boolean = true,
        requestSize: number
    ): Observable<FileSystem> {
        console.log('Filesystem.getFileSystem(bPersistent=' + bPersistent +
                    ', requestSize=' + requestSize + ')');
        const fsType: number = (
            bPersistent ? window.PERSISTENT :  window.TEMPORARY
        );
        let obs: Observable<FileSystem> = Observable.create((observer) => {
            window['webkitStorageInfo'].requestQuota(
                fsType,
                requestSize,
                (grantedBytes: number) => {
                    (
                        window.requestFileSystem ||
                            window['webkitRequestFileSystem']
                    )(
                        fsType,
                        grantedBytes,
                        (fs: FileSystem) => {
                            console.log('grantedBytes: ' + grantedBytes);
                            console.log('onInitFs():fs.name: ' + fs.name);
                            console.log('onInitFs():fs.root.toURL(): ' +
                                        fs.root.toURL());
                            observer.next(fs);
                            observer.complete();
                        },
                        (err: any) => {
                            console.log('onFsError():err.code: ' + err.code);
                            console.dir(err);
                            observer.error(err);
                        }
                    );
                },
                (err: any) => {
                    observer.error(err);
                }
            );
        });
        return obs;
    }

    /**
     * Write data into a file, starting at a particular location.
     * @param {string} path - the file to write to.
     * @param {Blob} blob - the data to write.
     * @param {number} seekOffset - the location (byte) to start writing from.
     * @param {boolean} bCreate - whether to create the file first or not.
     * @returns {Observable<void>}
     */
    public static writeToFile(
        fs: FileSystem,
        path: string,
        blob: Blob,
        seekOffset: number,
        bCreate: boolean
    ): Observable<void> {
        console.log('Filesystem.writeToFile(fs, ' + path +
                    ', bCreate=' + bCreate + ')');
        let obs: Observable<void> = Observable.create((observer) => {
            fs.root.getFile(
                path,
                { create: bCreate },
                (fileEntry: FileEntry) => {
                    // Create a FileWriter object for our FileEntry (log.txt).
                    fileEntry.createWriter(
                        (fileWriter: FileWriter) => {
                            fileWriter.onwriteend = (event: any) => {
                                console.log('Filesystem.writeToFile() - ' +
                                            'Wrote blob of size ' + blob.size +
                                            ' @ pos ' + seekOffset);
                                observer.next();
                                observer.complete();
                            };

                            fileWriter.onerror = (err1: any) => {
                                console.log('Write failed err1: ' + err1);
                                observer.error(err1);
                            };
                            if (seekOffset > 0) {
                                fileWriter.seek(seekOffset);
                            }
                            fileWriter.write(blob);
                        },
                        (err2: any) => {
                            console.log('Write failed err2: ' + err2);
                            observer.error(err2);
                        }
                    );
                },
                (err3: any) => {
                    console.log('Write failed err3: ' + err3);
                    observer.error(err3);
                }
            ); // fs.root.getFile(
        });
        return obs;
    }

    /**
     *
     */
    public static appendToFile(
        fs: FileSystem,
        path: string,
        blob: Blob
    ): Observable<FileEntry> {
        console.log('Filesystem.appendToFile(fs, ' + path + ', blob)');
        let obs: Observable<FileEntry> = Observable.create((observer) => {
            fs.root.getFile(
                path,
                { create: false },
                (fileEntry: FileEntry) => {
                    // Create a FileWriter object for our FileEntry (log.txt).
                    fileEntry.createWriter(
                        (fileWriter: FileWriter) => {
                            fileWriter.onwriteend = (event: any) => {
                                console.log('Filesystem.appendToFile() - ' +
                                            'Wrote ' + blob.size + ' bytes. ' +
                                            'Accum = ' + fileWriter.length +
                                            ' bytes');
                                observer.next(fileEntry);
                                observer.complete();
                            };
                            fileWriter.onerror = (err1: any) => {
                                console.log('Write failed err1: ' + err1);
                                observer.error(err1);
                            };
                            // see to end and write from there
                            fileWriter.seek(fileWriter.length);
                            fileWriter.write(blob);
                        },
                        (err2: any) => {
                            console.log('Write failed err2: ' + err2);
                            observer.error(err2);
                        }
                    );
                },
                (err3: any) => {
                    console.log('Write failed err3: ' + err3);
                    observer.error(err3);
                }
            ); // fs.root.getFile(
        });
        return obs;
    }

    /**
     *
     */
    public static getMetadata(
        fs: FileSystem,
        path: string
    ): Observable<Metadata> {
        console.log('Filesystem.getMetadata(fs, ' + path + ')');
        let obs: Observable<Metadata> = Observable.create((observer) => {
            fs.root.getFile(
                path,
                {create: false},
                (fileEntry: FileEntry) => {
                    fileEntry.getMetadata(
                        (metadata: Metadata) => {
                            console.log('Metadata: ');
                            console.dir(metadata);
                            observer.next(metadata);
                            observer.complete();
                        },
                        (err1: FileError) => {
                            console.log('getMetadata err1: ' + err1);
                            observer.error(err1);
                        }
                    );
                },
                (err2: any) => {
                    console.log('getMetadata err2: ' + err2);
                    observer.error(err2);
                }
            ); // fs.root.getFile(
        });
        return obs;
    }

    /**
     *
     */
    public static readFromFile(
        fs: FileSystem,
        path: string,
        startByte: number = undefined,
        endByte: number = undefined
    ): Observable<any> {
        console.log('Filesystem.readFromFile(fs, ' + path + ', ' +
                    startByte + ', ' + endByte + ')');
        let obs: Observable<any> = Observable.create((observer) => {
            fs.root.getFile(
                path,
                {create: false},
                (fileEntry: FileEntry) => {
                    fileEntry.file(
                        (file: File) => {
                            let fileReader: FileReader = new FileReader();

                            fileReader.onloadend = (event: ProgressEvent) => {
                                console.log('Filesystem.readFromFile() done. ' +
                                            event);
                                observer.next(fileReader.result);
                                observer.complete();
                            };

                            fileReader.onerror = (err1: any) => {
                                console.log('Filesystem.readFromFile() err1: ' +
                                            err1);
                                observer.error(err1);
                            };

                            if (startByte || endByte) {
                                // >=1 of startByte nor endByte were specified,
                                // read from startByte to endByte
                                // this is where we call slice()
                                const start: number = startByte || 0,
                                      end: number = endByte || file.size,
                                      blob: Blob = file.slice(start, end);
                                fileReader.readAsBinaryString(blob);
                            }
                            else {
                                // neither startByte nor endByte were specified,
                                // read entire file
                                fileReader.readAsBinaryString(file);
                            }
                        },
                        (err2: any) => {
                            console.log('Filesystem.readFromFile() err2: ' +
                                        err2);
                            observer.error(err2);
                        }
                    );
                },
                (err3: any) => {
                    console.log('Filesystem.readFromFile() err3: ' + err3);
                    observer.error(err3);
                }
            ); // fs.root.getFile(

        });
        return obs;
    }

    /**
     *
     */
    public static createDirectory(
        parentDirectoryEntry: DirectoryEntry,
        name: string
    ): Observable<DirectoryEntry> {
        console.log('Filesystem.createDirectory(' +
                    parentDirectoryEntry.fullPath + ', ' + name + ')');
        let obs: Observable<DirectoryEntry> = Observable.create((observer) => {
            parentDirectoryEntry.getDirectory(
                name,
                { create: true },
                (directoryEntry: DirectoryEntry) => {
                    observer.next(directoryEntry);
                    observer.complete();
                },
                (err: any) => {
                    observer.error(err);
                }
            );
        });
        return obs;
    }

    /**
     *
     */
    public static readDirectoryEntries(
        directoryEntry: DirectoryEntry
    ): Observable<Entry[]> {
        console.log('Filesystem.readDirectoryEntries(' +
                    directoryEntry.fullPath + '/');
        let obs: Observable<Entry[]> = Observable.create((observer) => {
            let dirReader: DirectoryReader = directoryEntry.createReader(),
                results: Entry[] = [],
                readEntries: () => void = () => {
                    dirReader.readEntries(
                        (entries: Entry[]) => {
                            if (entries.length) {
                                results = results.concat(entries);
                                readEntries();
                            }
                            else {
                                // base case - done
                                observer.next(results);
                                observer.complete();
                            }
                        },
                        (err: any) => {
                            observer.error(err);
                        }
                    );
                };
            // start reading dir entries
            readEntries();
        });
        return obs;
    }

}
