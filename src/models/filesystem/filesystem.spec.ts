import { FS } from './filesystem';

const WAIT_MSEC: number = 60;

let FILE_SYSTEM: FileSystem = null;

beforeEach((done: Function) => {
    FS.getFileSystem(true).subscribe(
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
