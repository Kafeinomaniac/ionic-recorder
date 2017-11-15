// Copyright (c) 2017 Tracktunes Inc

import { AppFilesystem } from './app-filesystem';
import { Filesystem, copyFromObject } from '../../models';

let appFilesystem: AppFilesystem = null;

describe('services/app-filesystem', () => {
    beforeEach(() => {
        appFilesystem = new AppFilesystem();
    });

    afterEach(() => {
        // reset things in storage:
        appFilesystem.setUpFileSystem();
    });

    it('initializes with a filesystem', (done) => {
        expect(appFilesystem).not.toBeNull();
        appFilesystem.whenReady().subscribe(
            () => {
                expect(appFilesystem.entryIcon(appFilesystem.folderEntry))
                    .toEqual('folder');
                expect(appFilesystem.getFilesystem()).toBeTruthy();
                done();
            }
        );
    });

    it('can go home', (done) => {
        appFilesystem.whenReady().subscribe(
            () => {

                appFilesystem.switchFolder('/').subscribe(
                    () => {
                        expect(appFilesystem.atHome()).toBe(true);
                        expect(appFilesystem.entries).toBeTruthy();
                        done();
                    }
                );
            }
        );
    });

    it('can create folder ' + TEST_FOLDER_PATH, (done) => {
        appFilesystem.whenReady().subscribe(
            () => {
                appFilesystem.createFolder(TEST_FOLDER_PATH).subscribe(
                    (dirEntry: DirectoryEntry) => {
                        expect(dirEntry).toBeTruthy();
                        done();
                    }
                );
            }
        );
    });

    it('can create file ' + TEST_FULL_PATH, (done) => {
        appFilesystem.whenReady().subscribe(
            () => {
                Filesystem.writeToFile(
                    appFilesystem.getFilesystem(),
                    TEST_FULL_PATH,
                    new Blob([TEST_DATA], { type: 'text/plain' }),
                    0,
                    true
                ).subscribe(
                    () => {
                        done();
                    }
                );
            }
        );
    });

    it('can read metadata of ' + TEST_FULL_PATH, (done) => {
        appFilesystem.whenReady().subscribe(
            () => {
                appFilesystem.getMetadata(TEST_FULL_PATH).subscribe(
                    (metadata: Metadata) => {
                        expect(metadata.modificationTime).toBeTruthy();
                        expect(metadata.size).toEqual(TEST_DATA.length);
                        done();
                    }
                );
            }
        );
    })

    it('can append to file ' + TEST_FULL_PATH + ' and verify size', (done) => {
        appFilesystem.whenReady().subscribe(
            () => {
                appFilesystem.appendToFile(
                    TEST_FULL_PATH,
                    new Blob(
                        [TEST_DATA],
                        { type: 'text/plain' }
                    )
                ).subscribe(
                    (fileEntry: FileEntry) => {
                        expect(fileEntry).toBeTruthy();
                        appFilesystem.getMetadata(TEST_FULL_PATH).subscribe(
                            (metadata: Metadata) => {
                                expect(metadata.modificationTime).toBeTruthy();
                                expect(metadata.size)
                                    .toEqual(TEST_DATA.length * 2);
                                done();
                            }
                        );
                    }
                );
            }
        );
    });

    it('can download ' + TEST_FULL_PATH + ' to device', (done) => {
        appFilesystem.whenReady().subscribe(
            () => {
                appFilesystem.downloadFileToDevice(TEST_FULL_PATH).subscribe(
                    () => {
                        done();
                    }
                );
            }
        );
    });

    /*

    it('can create a file and download it to device', (done) => {
        const data: string = 'test data',
              dataLen: number = data.length;
        appFilesystem.whenReady().subscribe(
            () => {
                Filesystem.writeToFile(
                    appFilesystem.getFilesystem(),
                    TEST_FILE_PATH,
                    new Blob([data], { type: 'text/plain' }),
                    0,
                    true
                ).subscribe(
                    () => {
                        appFilesystem.switchFolder('/').subscribe(
                            () => {
                                expect(appFilesystem.atHome()).toBe(true);
                                expect(appFilesystem.entries).toBeTruthy();
                                const nEntries: number =
                                      appFilesystem.nEntries();
                                expect(nEntries).toEqual(3);
                                expect(appFilesystem.getOrderIndex(
                                    TEST_FILE_PATH)).toEqual(1);
                                appFilesystem.downloadFileToDevice(
                                    TEST_FILE_PATH
                                ).subscribe(
                                    () => {
                                        appFilesystem.deletePaths(
                                            [TEST_FILE_PATH]
                                        ).subscribe(
                                            () => {
                                                appFilesystem.refreshFolder()
                                                    .subscribe(
                                                        () => {
                                                            expect(
                                                                appFilesystem
                                                                    .entries
                                                                    .length
                                                            ).toEqual(2);
                                                            done();
                                                        }
                                                    );
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    });

    it('can create a file and move it', (done) => {
        const data: string = 'test data',
              dataLen: number = data.length;
        appFilesystem.whenReady().subscribe(
            () => {
                appFilesystem.switchFolder(TEST_FOLDER_PATH).subscribe(
                    () => {
                        const nEntriesBefore: number = appFilesystem.nEntries();
                        Filesystem.writeToFile(
                            appFilesystem.getFilesystem(),
                            TEST_FILE_PATH,
                            new Blob([data], { type: 'text/plain' }),
                            0,
                            true
                        ).subscribe(
                            () => {
                                appFilesystem.movePaths(
                                    [TEST_FILE_PATH]
                                ).subscribe(
                                    () => {
                                        // file moved to TEST_FOLDER_PATH
                                        // appFilesystem.nEntries()
                                        expect(nEntriesBefore + 1)
                                            .toEqual(appFilesystem.nEntries());
                                        done();
                                    }
                                ); // appFilesystem.movePaths(
                            }
                        ); // Filesystem.writeToFile(
                    }
                ); // appFilesystem.switchFolder(TEST_FOLDER_PATH).subscribe(
            }
        ); // appFilesystem.whenReady().subscribe(
    });

    it('can create a file and rename it', (done) => {
        const data: string = 'test data',
              dataLen: number = data.length;
        appFilesystem.whenReady().subscribe(
            () => {
                appFilesystem.switchFolder('/').subscribe(
                    () => {
                        const nEntriesBefore: number = appFilesystem.nEntries(),
                              path: string = TEST_FOLDER_PATH + TEST_FILE_PATH;
                        Filesystem.writeToFile(
                            appFilesystem.getFilesystem(),
                            path,
                            new Blob([data], { type: 'text/plain' }),
                            0,
                            true
                        ).subscribe(
                            () => {
                                appFilesystem.rename(
                                    path,
                                    TEST_FILE_PATH2
                                ).subscribe(
                                    () => {
                                        done();
                                    }
                                ); // appFilesystem.movePaths(
                            }
                        ); // Filesystem.writeToFile(
                    }
                ); // appFilesystem.switchFolder(TEST_FOLDER_PATH).subscribe(
            }
        ); // appFilesystem.whenReady().subscribe(
    });
    */

    it('can clean up after above operations', (done) => {
        appFilesystem.whenReady().subscribe(
            () => {
                appFilesystem.deletePaths([TEST_FOLDER_PATH]).subscribe(
                    () => {
                        done();
                    }
                );
            }
        );
    });

});
