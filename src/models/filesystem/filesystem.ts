import { Observable } from 'rxjs/Rx';

export class FS {

    public static getEntriesFromPaths(
        fileSystem: FileSystem,
        paths: string[]
    ): Observable<Entry[]> {
        console.log('FS.getEntriesFromPaths(fs, ' + paths + ')');
        let entryObservableArray: Observable<Entry>[] =
            paths.map((path: string) => {
                return FS.getPathEntry(fileSystem, path, false);
            }),
            result: Entry[] = [],
            src: Observable<Entry[]> = Observable.create((observer) => {
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
        return src;
    }

    public static deleteEntries(
        fileSystem: FileSystem,
        paths: string[]
    ): Observable<void> {
        console.log('FS.deleteEntries(fs, ' + paths + ')');
        let entryObservableArray: Observable<Entry>[] =
            paths.map((path: string) => {
                return FS.getPathEntry(fileSystem, path, false);
            }),
            src: Observable<void> = Observable.create((observer) => {
                Observable.from(entryObservableArray).concatAll().subscribe(
                    (entry: Entry) => {
                        FS.deleteEntry(entry).subscribe(
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
        return src;
    }

    public static moveEntries(
        fileSystem: FileSystem,
        paths: string[],
        parent: DirectoryEntry
    ): Observable<void> {
        console.log('FS.moveEntries(fs, ' + paths + ',' + parent.name + ')');
        let entryObservableArray: Observable<Entry>[] =
            paths.map((path: string) => {
                return FS.getPathEntry(fileSystem, path, false);
            }),
            src: Observable<void> = Observable.create((observer) => {
                Observable.from(entryObservableArray).concatAll().subscribe(
                    (entry: Entry) => {
                        FS.moveEntry(entry, parent).subscribe(
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
        return src;
    }

    public static moveEntry(
        entry: Entry,
        parent: DirectoryEntry
    ): Observable<void> {
        let src: Observable<void> = Observable.create((observer) => {
            const successCB: (ent: Entry) => void = (ent: Entry) => {
                console.log('FS.moveEntry.successCB()');
                observer.next();
                observer.complete();
            };
            const errorCB: (error: FileError) => void = (error: FileError) => {
                console.log('FS.moveEntry.errorCB()');
                observer.error(error);
            };
            entry.moveTo(parent, entry.name, successCB, errorCB);
        });
        return src;
    }

    public static deleteEntry(entry: Entry): Observable<void> {
        console.log('FS.deleteEntry(' + entry.fullPath + ')');
        let src: Observable<void> = Observable.create((observer) => {
            if (entry.isFile) {
                entry.remove(
                    () => {
                        console.log('FS.deleteEntry(): Done removing ' +
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
                        console.log('FS.deleteEntry(): Done removing ' +
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
        return src;
    }

    public static getPathEntry(
        fileSystem: FileSystem,
        path: string,
        bCreate: boolean = false
    ): Observable<Entry> {
        console.log('FS.getPathEntry(fs, ' + path + ', ' + bCreate + ')');
        let src: Observable<Entry> = Observable.create((observer) => {
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
                        console.log('FS.getPathEntry(.., ' + path +
                                    ') error1: ' + err);
                        observer.error(err);
                    }
                );
            } // if (path[path.length - 1] === '/') {
            else {
                // it's a file
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
        return src;
    }

    public static getFileSystem(
        bPersistent: boolean = true,
        requestSize: number
    ): Observable<FileSystem> {
        console.log('FS.getFileSystem(bPersistent=' + bPersistent +
                    ', requestSize=' + requestSize);
        const fsType: number = (
            bPersistent ? window.PERSISTENT :  window.TEMPORARY
        );
        let src: Observable<FileSystem> = Observable.create((observer) => {
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
        return src;
    }

    public static writeToFile(
        fs: FileSystem,
        path: string,
        blob: Blob,
        seekOffset: number = 0,
        bCreate: boolean = true
    ): Observable<void> {
        console.log('FS.writeToFile(fs, ' + path +
                    ', bCreate=' + bCreate + ')');
        let src: Observable<void> = Observable.create((observer) => {
            fs.root.getFile(
                path,
                { create: bCreate },
                (fileEntry: FileEntry) => {
                    // Create a FileWriter object for our FileEntry (log.txt).
                    fileEntry.createWriter(
                        (fileWriter: FileWriter) => {
                            fileWriter.onwriteend = (event: any) => {
                                console.log('Write completed. ' + event);
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
        return src;
    }

    public static appendToFile(
        fs: FileSystem,
        path: string,
        blob: Blob
    ): Observable<FileEntry> {
        console.log('FS.appendToFile(fs, ' + path + ', blob)');
        let src: Observable<FileEntry> = Observable.create((observer) => {
            fs.root.getFile(
                path,
                { create: false },
                (fileEntry: FileEntry) => {
                    // Create a FileWriter object for our FileEntry (log.txt).
                    fileEntry.createWriter(
                        (fileWriter: FileWriter) => {
                            fileWriter.onwriteend = (event: any) => {
                                console.log('Write completed. ' + event);
                                observer.next(fileEntry);
                                observer.complete();
                            };
                            fileWriter.onerror = (err1: any) => {
                                console.log('Write failed err1: ' + err1);
                                observer.error(err1);
                            };
                            // see to end and write from there
                            console.log('*********** writer.length: ' +
                                        fileWriter.length + ' *************');
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
        return src;
    }

    public static getMetadata(
        fs: FileSystem,
        path: string
    ): Observable<Metadata> {
        console.log('FS.getMetadata(fs, ' + path + ')');
        let src: Observable<Metadata> = Observable.create((observer) => {
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
        return src;
    }

    public static readFromFile(
        fs: FileSystem,
        path: string
    ): Observable<any> {
        console.log('FS.readFromFile(fs, ' + path + ')');
        let src: Observable<any> = Observable.create((observer) => {
            fs.root.getFile(
                path,
                {create: false},
                (fileEntry: FileEntry) => {
                    fileEntry.file(
                        (file: File) => {
                            let fileReader: FileReader = new FileReader();

                            fileReader.onloadend = (event: ProgressEvent) => {
                                console.log('FS.readFromFile() completed. ' +
                                            event);
                                observer.next(fileReader.result);
                                observer.complete();
                            };

                            fileReader.onerror = (err1: any) => {
                                console.log('FS.readFromFile() failed err1: ' +
                                            err1);
                                observer.error(err1);
                            };
                            // fileReader.readAsArrayBuffer(file);
                            fileReader.readAsBinaryString(file);
                        },
                        (err2: any) => {
                            console.log('FS.readFromFile() failed err2: ' +
                                        err2);
                            observer.error(err2);
                        }
                    );
                },
                (err3: any) => {
                    console.log('FS.readFromFile() failed err3: ' + err3);
                    observer.error(err3);
                }
            ); // fs.root.getFile(
        });
        return src;
    }

    public static createDirectory(
        parentDirectoryEntry: DirectoryEntry,
        name: string
    ): Observable<DirectoryEntry> {
        console.log('FS.createDirectory(' + parentDirectoryEntry.fullPath +
                    ', ' + name + ')');
        let src: Observable<DirectoryEntry> = Observable.create((observer) => {
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
        return src;
    }

    public static readDirectoryEntries(
        directoryEntry: DirectoryEntry
    ): Observable<Entry[]> {
        console.log('FS.readDirectoryEntries(' + directoryEntry.name + '/');
        let src: Observable<Entry[]> = Observable.create((observer) => {
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
        return src;
    }

}
