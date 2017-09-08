import {
    Observable
}
from 'rxjs/Rx';

const REQUEST_SIZE: number = 1024 * 1024 * 1024;

export class FS {

    public static getFileSystem(
        bPersistent: boolean = true
    ): Observable < FileSystem > {
        const fsType: number = (
            bPersistent ?
            window.PERSISTENT :
            window.TEMPORARY
        );
        let src: Observable < FileSystem > = Observable.create((observer) => {
            window['webkitStorageInfo'].requestQuota(
                fsType,
                REQUEST_SIZE,
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

    public static writeFile(
        fs: FileSystem,
        name: string,
        blob: Blob
    ): Observable < void > {
        let src: Observable < void > = Observable.create((observer) => {
            fs.root.getFile(
                name, { create: true },
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

    public static readFile(fs: FileSystem, name: string): Observable < any > {
        let src: Observable < any > = Observable.create((observer) => {
            fs.root.getFile(
                name, {},
                (fileEntry: FileEntry) => {
                    fileEntry.file(
                        (file: File) => {
                            let fileReader: FileReader = new FileReader();

                            fileReader.onloadend = (event: ProgressEvent) => {
                                console.log('Read completed. ' + event);
                                observer.next(fileReader.result);
                                observer.complete();
                            };

                            fileReader.onerror = (err1: any) => {
                                console.log('Read failed err1: ' + err1);
                                observer.error(err1);
                            };
                            fileReader.readAsBinaryString(file);
                        },
                        (err2: any) => {
                            console.log('Read failed err2: ' + err2);
                            observer.error(err2);
                        }
                    );
                },
                (err3: any) => {
                    console.log('Read failed err3: ' + err3);
                    observer.error(err3);
                }
            ); // fs.root.getFile(
        });
        return src;
    }

    public static createDirectory(
        parentDirectoryEntry: DirectoryEntry,
        name: string
    ): Observable < DirectoryEntry > {
        let src: Observable < DirectoryEntry > = Observable.create((observer) => {
            parentDirectoryEntry.getDirectory(
                name, { create: true },
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

    public static readDirectory(
        directoryEntry: DirectoryEntry
    ): Observable < Entry[] > {
        let src: Observable < Entry[] > = Observable.create((observer) => {
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
