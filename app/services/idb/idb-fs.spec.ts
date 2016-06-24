// Copyright (c) 2016 Tracktunes Inc

import {
    IdbFS,
    TreeNode,
    DB_KEY_PATH,
    ParentChild
} from './idb-fs';

const WAIT_MSEC: number = 60;

const ROOT_FOLDER_NAME: string = 'root';

const DB_NAME: string = 'f';
const DB_VERSION: number = 3;

IdbFS.persistentDeleteDb(DB_NAME).subscribe();

let idbFS: IdbFS = new IdbFS(
    DB_NAME,
    DB_VERSION,
    ROOT_FOLDER_NAME
);

let db: IDBDatabase,
    folder1: TreeNode,
    folder3: TreeNode,
    // folder5: TreeNode,
    item2: TreeNode;
// item4: TreeNode,
// item6: TreeNode,
// item7: TreeNode;

beforeEach((done: Function) => {
    idbFS.waitForDB().subscribe(
        (database: IDBDatabase) => {
            db = database;
            done();
        },
        (error) => {
            fail(error);
        });
});

// jasmine.DEFAULT_TIMEOUT_INTERVAL = WAIT_MSEC;

describe('services/idb:IdbFS', () => {
    it('initializes', (done) => {
        setTimeout(
            () => {
                expect(idbFS).not.toBeFalsy();
                expect(db).not.toBeFalsy();
                done();
            },
            WAIT_MSEC);
    });

    it('can make nodes and test them', (done) => {
        setTimeout(
            () => {
                // verify folder node creation
                let node: TreeNode = IdbFS.makeTreeNode('test');
                expect(IdbFS.isFolderNode(node)).toBe(true);
                expect(IdbFS.isDataNode(node)).toBe(false);
                expect(node['parentKey']).toBe(null);
                expect(node['data']).toBe(undefined);
                expect(node[DB_KEY_PATH]).toBeUndefined();

                // invalid parentKey tests
                node['parentKey'] = 0;
                try {
                    IdbFS.makeTreeNode('test', 0, 'data');
                }
                catch (error) {
                    expect(error.toString())
                        .toEqual('Error: makeTreeNode(): invalid parentKey');
                }
                try {
                    IdbFS.makeTreeNode('test', 1.1, 'data');
                }
                catch (error) {
                    expect(error.toString())
                        .toEqual('Error: makeTreeNode(): invalid parentKey');
                }
                try {
                    IdbFS.makeTreeNode('test', Infinity, 'data');
                }
                catch (error) {
                    expect(error.toString())
                        .toEqual('Error: makeTreeNode(): invalid parentKey');
                }

                // verify data node creation
                node = IdbFS.makeTreeNode('test', 111, 'data');
                expect(IdbFS.isFolderNode(node)).toEqual(false);
                expect(IdbFS.isDataNode(node)).toEqual(true);
                expect(node.parentKey).toEqual(111);
                expect(node.data).toEqual('data');
                done();
            },
            WAIT_MSEC);
    });

    it('can read root folder (' + ROOT_FOLDER_NAME + ')', (done) => {
        setTimeout(
            () => {
                idbFS.readNode(1).subscribe(
                    (rootNode: TreeNode) => {
                        expect(rootNode.childOrder).toBeDefined();
                        expect(rootNode[DB_KEY_PATH]).toBe(1);
                    },
                    (error) => {
                        fail(error);
                    }
                );
                done();
            },
            WAIT_MSEC);
    });

    it('can create folder1, child of ' + ROOT_FOLDER_NAME, (done) => {
        setTimeout(
            () => {
                idbFS.createNode('folder1', 1).subscribe(
                    (parentChild: ParentChild) => {
                        folder1 = parentChild.child;
                        expect(folder1.parentKey).toBe(1);
                        expect(folder1.data).toBeUndefined();
                        expect(parentChild.parent[DB_KEY_PATH]).toBe(1);
                        done();
                    },
                    (error) => {
                        fail(error);
                    });
            },
            WAIT_MSEC);
    });

    it('can create item2, child of folder1', (done) => {
        setTimeout(
            () => {
                idbFS.createNode(
                    'item2',
                    folder1[DB_KEY_PATH],
                    'i am the datum'
                ).subscribe(
                    (parentChild: ParentChild) => {
                        item2 = parentChild.child;
                        expect(item2.parentKey).toBe(folder1[DB_KEY_PATH]);
                        expect(item2['data']).toBe('i am the datum');
                        expect(item2.timeStamp).not.toBeFalsy();
                        folder1 = parentChild.parent;
                        expect(folder1.childOrder).toEqual([
                            item2[DB_KEY_PATH]
                        ]);
                        expect(item2[DB_KEY_PATH]).toBe(3);

                        done();
                    },
                    (error) => {
                        fail(error);
                    });
            },
            WAIT_MSEC);
    });

    it('can create folder3, child of folder1', (done) => {
        setTimeout(
            () => {
                idbFS.createNode(
                    'folder3',
                    folder1[DB_KEY_PATH]).subscribe(
                    (parentChild: ParentChild) => {
                        folder3 = parentChild.child;
                        expect(folder3.parentKey).toBe(folder1[DB_KEY_PATH]);
                        expect(folder3['data']).toBeUndefined();
                        expect(folder3.name).toEqual('folder3');
                        expect(folder3.timeStamp).not.toBeFalsy();
                        folder1 = parentChild.parent;
                        expect(folder1.childOrder).toEqual([
                            folder3[DB_KEY_PATH],
                            item2[DB_KEY_PATH]
                        ]);
                        done();
                    },
                    (error) => {
                        fail(error);
                    });
            },
            WAIT_MSEC);
    });

});
