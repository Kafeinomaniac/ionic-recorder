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
