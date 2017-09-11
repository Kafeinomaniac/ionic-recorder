import { FS } from './filesystem';

const WAIT_MSEC: number = 60;
const REQUEST_SIZE: number = 1024 * 1024 * 1024;

let FILE_SYSTEM: FileSystem = null;

beforeEach((done: Function) => {
    FS.getFileSystem(true, REQUEST_SIZE).subscribe(
        (fileSystem: FileSystem) => {
            FILE_SYSTEM = fileSystem;
            done();
        },
        (err: any) => {
            fail(err);
        }
    );
});

describe('services/filesystem', () => {
    it('initializes', (done) => {
        setTimeout(
            () => {
                expect(FILE_SYSTEM).not.toBeFalsy();
                done();
            },
            WAIT_MSEC);
    });

    it('can get the root dir entry', (done) => {
        FS.getPathEntry(FILE_SYSTEM, '/', false).subscribe(
            (entry: Entry) => {
                expect(entry.name).toEqual('');
                expect(entry.fullPath).toEqual('/');
                expect(entry.isFile).toBeFalsy();
                expect(entry.isDirectory).toBeTruthy();
                done();
            }
        );
    });

    // there is an /Unfiled directory in the filesystem because,
    // even though this test deletes it, the initialization of the
    // app recreates it, so we can delete it here with no error
    it('can delete /Unfiled recursively', (done) => {
        FS.removeEntries(FILE_SYSTEM, ['/Unfiled/']).subscribe(
            () => {
                done();
            }
        );
    });

    it('cannot read directory /Unfiled', (done) => {
        FS.getPathEntry(FILE_SYSTEM, '/Unfiled/', false).subscribe(
            (entry: Entry) => {
                console.log('NOT SUPPOSED TO GET HERE: ' + entry.name);
            },
            (err: any) => {
                console.log('EXPECTED ERROR: ' + err);
                done();
            }
        );
    });

    // system should allow us to create a directory that's already
    // been created, without error
    it('can create directory /Unfiled', (done) => {
        FS.getPathEntry(FILE_SYSTEM, '/Unfiled/', true).subscribe(
            (entry: Entry) => {
                expect(entry.name).toEqual('Unfiled');
                expect(entry.fullPath).toEqual('/Unfiled');
                expect(entry.isFile).toBeFalsy();
                expect(entry.isDirectory).toBeTruthy();
                done();
            }
        );
    });

    it('can create directory /Unfiled/tstsubdir', (done) => {
        FS.getPathEntry(FILE_SYSTEM, '/Unfiled/tstsubdir/', true).subscribe(
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
        FS.removeEntries(FILE_SYSTEM, ['/Unfiled/']).subscribe(
            () => {
                done();
            }
        );
    });

    it('can create Recent directory', (done) => {
        FS.getPathEntry(FILE_SYSTEM, '/Recent/', true).subscribe(
            (entry: Entry) => {
                expect(entry.name).toEqual('Recent');
                expect(entry.fullPath).toEqual('/Recent');
                expect(entry.isFile).toBeFalsy();
                expect(entry.isDirectory).toBeTruthy();
                done();
            }
        );
    });

    it('can read the root directory', (done) => {
        FS.readDirectory(FILE_SYSTEM.root).subscribe(
            (entries: Entry[]) => {
                // expect(entries.length).toEqual(0);
                done();
            }
        );
    });

    it('can create a file in root dir', (done) => {
        FS.writeFile(
            FILE_SYSTEM,
            'testing.txt',
            new Blob(['Lorem Ipsum4'], { type: 'text/plain' })
        ).subscribe(() => {
            done();
        });
    });

    it('can create a file then read it', (done) => {
        const data: string = 'Lorem Ipsum5';
        FS.writeFile(
            FILE_SYSTEM,
            'testing.txt',
            new Blob([data], { type: 'text/plain' })
        ).subscribe(() => {
            FS.readFile(FILE_SYSTEM, 'testing.txt')
                .subscribe(
                    (blob: Blob) => {
                        console.log('READ BLOB!!! ' + blob);
                        console.log(typeof(blob));
                        expect(typeof(blob)).toEqual('string');
                        expect(blob.toString()).toEqual(data);
                        done();
                    }
                );
        });
    });

    it('can create /Unfiled directory at root', (done) => {
        setTimeout(
            () => {
                FS.createDirectory(FILE_SYSTEM.root, 'Unfiled').subscribe(
                    (directoryEntry: DirectoryEntry) => {
                        expect(directoryEntry.name).toEqual('Unfiled');
                        expect(directoryEntry.isDirectory).toBe(true);
                        expect(directoryEntry.isFile).toBe(false);
                        done();
                    }
                );
            },
            WAIT_MSEC);
    });

}); // describe('services/filesystem', () => {
