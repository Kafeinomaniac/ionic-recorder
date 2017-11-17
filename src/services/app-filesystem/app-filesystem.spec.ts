// Copyright (c) 2017 Tracktunes Inc

import { AppFilesystem, DEFAULT_PATH } from './app-filesystem';
import {
    Filesystem,
    copyFromObject,
    getFullPath,
    pathParent
} from '../../models';

const TEST_FILENAME: string = 'foo_file.txt';
const TEST_FILENAME2: string = 'foo_file2.txt';
const TEST_FOLDER_PATH: string = '/foo_folder/';
const TEST_FOLDER_NAME2: string = 'foo_folder2';
const TEST_FULL_PATH: string = TEST_FOLDER_PATH + TEST_FILENAME;
const TEST_DATA: string = 'test data';

let appFilesystem: AppFilesystem = null,
    initialPath: string = null,
    initialSelectedPaths: { [path: string]: number } = {};

describe('services/app-filesystem', () => {
    beforeEach(() => {
        appFilesystem = new AppFilesystem();
    });

    afterEach(() => {
        // reset things in storage:
        copyFromObject(initialSelectedPaths, appFilesystem.selectedPaths);
        appFilesystem.setUpFileSystem();
    });

    it('initializes with a filesystem', (done) => {
        expect(appFilesystem).not.toBeNull();
        appFilesystem.whenReady().subscribe(
            () => {
                initialPath = appFilesystem.getPath();
                copyFromObject(appFilesystem.selectedPaths,
                               initialSelectedPaths);
                appFilesystem.clearSelection();
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
                        expect(appFilesystem.entries.length).toEqual(1);
                        done();
                    }
                );
            }
        );
    });

    // now at root: /

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

    it('can select /' + TEST_FULL_PATH, (done) => {
        appFilesystem.whenReady().subscribe(
            () => {
                appFilesystem.switchFolder(pathParent(TEST_FULL_PATH))
                    .subscribe(
                        () => {
                            const nPrevSelected = appFilesystem.nSelected();
                            expect(appFilesystem.nEntries()).toEqual(1);
                            appFilesystem.selectAllOrNone(true);
                            expect(appFilesystem.nSelected())
                                .toEqual(nPrevSelected + 1);
                            done();
                        }
                    );
            }
        );
    });

    // now in pathParent(TEST_FULL_PATH) - /foo_folder/

    it('can getSelectedEntries() and unselect them', (done) => {
        appFilesystem.whenReady().subscribe(
            () => {
                appFilesystem.getSelectedEntries().subscribe(
                    (entries: Entry[]) => {
                        expect(entries.length).toEqual(1);
                        entries.forEach((entry: Entry) => {
                            const fullPath: string = getFullPath(entry);
                            expect(appFilesystem.isEntrySelected(entry))
                                .toBeTruthy();
                            appFilesystem.unSelectEntry(entry);
                            expect(appFilesystem.isEntrySelected(entry))
                                .toBeFalsy();
                            expect(appFilesystem.nSelected()).toEqual(0);
                            appFilesystem.selectEntry(entry);
                            expect(appFilesystem.nSelected()).toEqual(1);
                            appFilesystem.toggleSelectEntry(entry);
                            expect(appFilesystem.nSelected()).toEqual(0);
                            appFilesystem.toggleSelectEntry(entry);
                            expect(appFilesystem.nSelected()).toEqual(1);
                            appFilesystem.selectAllOrNone(false);
                            expect(appFilesystem.nSelected()).toEqual(0);
                            appFilesystem.toggleSelectEntry(entry);
                            expect(appFilesystem.nSelected()).toEqual(1);
                            appFilesystem.clearSelection();
                            expect(appFilesystem.nSelected()).toEqual(0);
                        });

                        done();
                    }
                );
            }
        );
    });

    it('can deleteSelected()', (done) => {
        appFilesystem.whenReady().subscribe(
            () => {
                // there is only one to select we are in /foo_folder/
                appFilesystem.selectAllOrNone(true);
                expect(appFilesystem.nSelected()).toEqual(1);
                appFilesystem.deleteSelected().subscribe(
                    () => {
                        expect(appFilesystem.nSelected()).toEqual(0);
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

    it('can move file to /', (done) => {
        appFilesystem.whenReady().subscribe(
            () => {
                appFilesystem.switchFolder('/').subscribe(
                    () => {
                        const nEntriesBefore: number = appFilesystem.nEntries();
                        appFilesystem.movePaths([TEST_FULL_PATH]).subscribe(
                            () => {
                                expect(nEntriesBefore + 1)
                                    .toEqual(appFilesystem.nEntries());
                                done();
                            }
                        ); // appFilesystem.movePaths(
                    }
                ); // Filesystem.writeToFile(
            }
        ); // appFilesystem.whenReady().subscribe(
    });

    it('can rename ' + TEST_FILENAME + ' to ' + TEST_FILENAME2, (done) => {
        appFilesystem.whenReady().subscribe(
            () => {
                appFilesystem.rename(
                    '/' + TEST_FILENAME,
                    TEST_FILENAME2
                ).subscribe(
                    () => {
                        Filesystem.getPathEntry(
                            appFilesystem.getFilesystem(),
                            TEST_FILENAME2,
                            false
                        ).subscribe(
                            (entry: Entry) => {
                                done();
                            }
                        );
                    }
                ); // appFilesystem.movePaths(
            }
        ); // appFilesystem.whenReady().subscribe(
    });

    it('can rename ' + TEST_FOLDER_PATH + ' to ' + TEST_FOLDER_NAME2,
       (done) => {
           appFilesystem.whenReady().subscribe(
               () => {
                   appFilesystem.rename(
                       TEST_FOLDER_PATH,
                       TEST_FOLDER_NAME2
                   ).subscribe(
                       () => {
                           done();
                           Filesystem.getPathEntry(
                               appFilesystem.getFilesystem(),
                               '/' + TEST_FOLDER_NAME2 + '/',
                               false
                           ).subscribe(
                               (entry: Entry) => {
                                   done();
                               }
                           );
                       }
                   ); // appFilesystem.movePaths(
               }
           ); // appFilesystem.whenReady().subscribe(
       });

    it('can verify order index of ' + TEST_FILENAME2, (done) => {
        appFilesystem.whenReady().subscribe(
            () => {
                expect(appFilesystem.getOrderIndex('/' + TEST_FILENAME2) <
                       appFilesystem.entries.length).toBeTruthy();
                done();
            }
        ); // appFilesystem.whenReady().subscribe(
    });

    it('can refreshFolder()', (done) => {
        appFilesystem.whenReady().subscribe(
            () => {
                const nEntriesBefore: number = appFilesystem.nEntries(),
                      currentFolderPath: string = appFilesystem.getPath();
                Filesystem.writeToFile(
                    appFilesystem.getFilesystem(),
                    currentFolderPath + TEST_FILENAME,
                    new Blob([TEST_DATA], { type: 'text/plain' }),
                    0,
                    true
                ).subscribe(
                    () => {
                        expect(appFilesystem.nEntries())
                            .toEqual(nEntriesBefore);
                        appFilesystem.refreshFolder().subscribe(
                            () => {
                                expect(appFilesystem.nEntries())
                                    .toEqual(nEntriesBefore + 1);
                                done();
                            }
                        );
                    }
                );
            }
        );
    });

    it('can clean up after above operations', (done) => {
        appFilesystem.whenReady().subscribe(
            () => {
                appFilesystem.deletePaths([
                    TEST_FOLDER_NAME2 + '/',
                    '/' + TEST_FILENAME2
                ]).subscribe(
                    () => {
                        appFilesystem.switchFolder(initialPath).subscribe();
                        appFilesystem.saveSelectedPaths(initialSelectedPaths);
                        done();
                    }
                );
            }
        );
    });

});
