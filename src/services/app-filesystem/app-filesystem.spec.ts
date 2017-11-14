// Copyright (c) 2017 Tracktunes Inc

import { AppFilesystem } from './app-filesystem';
import { Filesystem } from '../../models';

const TEST_FILE_PATH: string = '/foo_file';
const TEST_FOLDER_PATH: string = '/foo_folder/';

let appFilesystem: AppFilesystem = null;

describe('services/app-filesystem', () => {
    beforeEach(() => {
        appFilesystem = new AppFilesystem();
    });

    it('initializes with a filesystem', (done) => {
        expect(appFilesystem).not.toBeNull();
        appFilesystem.whenReady().subscribe(
            () => {
                expect(appFilesystem.getFilesystem()).toBeTruthy();
                done();
            }
        );
    });

    it('can createFolder(' + TEST_FOLDER_PATH + '), and go there', (done) => {
        appFilesystem.whenReady().subscribe(
            () => {
                appFilesystem.createFolder(TEST_FOLDER_PATH).subscribe(
                    (dirEntry: DirectoryEntry) => {
                        expect(dirEntry).toBeTruthy();
                        appFilesystem.switchFolder(TEST_FOLDER_PATH).subscribe(
                            () => {
                                expect(appFilesystem.getPath())
                                    .toEqual(TEST_FOLDER_PATH);
                                appFilesystem.refreshFolder().subscribe(
                                    () => {
                                        expect(appFilesystem.getOrderIndex(
                                            TEST_FOLDER_PATH
                                        )).toEqual(-1);
                                        done();
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    });

    it('can create a file in folder ' + TEST_FOLDER_PATH, (done) => {
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
                        appFilesystem.getMetadata(TEST_FILE_PATH).subscribe(
                            (metadata: Metadata) => {
                                expect(metadata.modificationTime).toBeTruthy();
                                expect(metadata.size).toEqual(dataLen);
                                appFilesystem.appendToFile(
                                    TEST_FILE_PATH,
                                    new Blob(
                                        [data],
                                        { type: 'text/plain' }
                                    )
                                ).subscribe(
                                    (fileEntry: FileEntry) => {
                                        expect(fileEntry).toBeTruthy();
                                        appFilesystem.getMetadata(
                                            TEST_FILE_PATH
                                        ).subscribe(
                                            (metadata: Metadata) => {
                                                expect(
                                                    metadata.modificationTime
                                                ).toBeTruthy();
                                                expect(metadata.size)
                                                    .toEqual(dataLen * 2);
                                                appFilesystem.deletePaths(
                                                    [TEST_FILE_PATH]
                                                ).subscribe(
                                                    () => {
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

});
