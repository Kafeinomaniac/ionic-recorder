import { Filesystem } from './filesystem';

const WAIT_MSEC: number = 60;
const REQUEST_SIZE: number = 1024 * 1024 * 1024;
const TEST_FILE_PATH: string = 'test_file.txt';

let FILE_SYSTEM: FileSystem = null;

beforeEach((done: Function) => {
    Filesystem.getFileSystem(true, REQUEST_SIZE).subscribe(
        (fileSystem: FileSystem) => {
            FILE_SYSTEM = fileSystem;
            done();
        },
        (err: any) => {
            fail(err);
        }
    );
});

describe('models/filesystem', () => {
    it('initializes', (done) => {
        setTimeout(
            () => {
                expect(FILE_SYSTEM).not.toBeFalsy();
                done();
            },
            WAIT_MSEC);
    });

    it('can get the root dir entry', (done) => {
        Filesystem.getPathEntry(FILE_SYSTEM, '/', false).subscribe(
            (entry: Entry) => {
                expect(entry.name).toEqual('');
                expect(entry.fullPath).toEqual('/');
                expect(entry.isFile).toBeFalsy();
                expect(entry.isDirectory).toBeTruthy();
                done();
            }
        );
    });

    it('can erase everything', (done) => {
        Filesystem.eraseEverything(FILE_SYSTEM).subscribe(
            () => {
                done();
            }
        );
    });

    it('can read the root folder contents to be empty', (done) => {
        Filesystem.readFolderEntries(FILE_SYSTEM.root).subscribe(
            (entries: Entry[]) => {
                expect(entries.length).toEqual(0);
                done();
            }
        );
    });

    it('cannot delete /Unfiled recursively', (done) => {
        Filesystem.deleteEntries(FILE_SYSTEM, ['/Unfiled/']).subscribe(
            null,
            (err: any) => {
                done();
            }
        );
    });

    it('cannot read folder /Unfiled', (done) => {
        Filesystem.getPathEntry(FILE_SYSTEM, '/Unfiled/', false).subscribe(
            null,
            (err: any) => {
                done();
            }
        );
    });

    // system should allow us to create a folder that's already
    // been created, without error
    it('can create folder /Unfiled', (done) => {
        Filesystem.getPathEntry(FILE_SYSTEM, '/Unfiled/', true).subscribe(
            (entry: Entry) => {
                expect(entry.name).toEqual('Unfiled');
                expect(entry.fullPath).toEqual('/Unfiled');
                expect(entry.isFile).toBeFalsy();
                expect(entry.isDirectory).toBeTruthy();
                done();
            }
        );
    });

    it('can create folder /Unfiled/tstsubdir', (done) => {
        Filesystem.getPathEntry(
            FILE_SYSTEM,
            '/Unfiled/tstsubdir/',
            true
        ).subscribe(
            (entry: Entry) => {
                expect(entry.name).toEqual('tstsubdir');
                expect(entry.fullPath).toEqual('/Unfiled/tstsubdir');
                expect(entry.isFile).toBeFalsy();
                expect(entry.isDirectory).toBeTruthy();
                done();
            }
        );
    });

    it('can delete /Unfiled recursively', (done) => {
        Filesystem.deleteEntries(FILE_SYSTEM, ['/Unfiled/']).subscribe(
            () => {
                done();
            }
        );
    });

    it('can create a file in root w/content A & read it', (done) => {
        const data: string = 'A';
        Filesystem.writeToFile(
            FILE_SYSTEM,
            TEST_FILE_PATH,
            new Blob([data], { type: 'text/plain' }),
            0,
            true
        ).subscribe(() => {
            Filesystem.readFromFile(FILE_SYSTEM, TEST_FILE_PATH).subscribe(
                (buffer: ArrayBuffer) => {
                    const view: DataView = new DataView(buffer);
                    expect(String.fromCharCode(view.getUint8(0)))
                        .toEqual(data);
                    done();
                }
            );
        });
    });

    it('can write content B to same file then read it', (done) => {
        const data: string = 'B';
        Filesystem.writeToFile(
            FILE_SYSTEM,
            TEST_FILE_PATH,
            new Blob([data], { type: 'text/plain' }),
            0,
            false
        ).subscribe(() => {
            Filesystem.readFromFile(FILE_SYSTEM, TEST_FILE_PATH).subscribe(
                (buffer: ArrayBuffer) => {
                    const view: DataView = new DataView(buffer);
                    expect(String.fromCharCode(view.getUint8(0)))
                        .toEqual(data);
                    done();
                }
            );
        });
    });

    it('can delete the file it just created', (done) => {
        Filesystem.getPathEntry(FILE_SYSTEM, TEST_FILE_PATH, false).subscribe(
            (entry: Entry) => {
                Filesystem.deleteEntry(entry).subscribe(
                    () => {
                        done();
                    }
                );
            }
        );
    });

    it('can read the root folder contents to be empty', (done) => {
        Filesystem.readFolderEntries(FILE_SYSTEM.root).subscribe(
            (entries: Entry[]) => {
                expect(entries.length).toEqual(0);
                done();
            }
        );
    });

}); // describe('models/filesystem', () => {
