// Copyright (c) 2016 Tracktunes Inc

// import {
//     deleteDb
// } from './idb';

import {
    IdbFS,
    TreeNode
} from './idb-fs';

const IT_TIMEOUT_MSEC: number = 60;

let idbFS: IdbFS = new IdbFS(
    'f',
    1,
    'root'
);

// deleteDb('f');

let dbFS: IDBDatabase;

beforeEach((done: Function) => {
    idbFS.waitForDB().subscribe(
        (database: IDBDatabase) => {
            dbFS = database;
            done();
        },
        (error) => {
            fail(error);
        });
});

// jasmine.DEFAULT_TIMEOUT_INTERVAL = IT_TIMEOUT_MSEC;

describe('services/idb:IdbFS', () => {
    it('initializes', (done) => {
        setTimeout(
            () => {
                expect(idbFS).not.toBeFalsy();
                expect(dbFS).not.toBeFalsy();
                done();
            },
            IT_TIMEOUT_MSEC);
    });

    it('can make nodes and test them', (done) => {
        setTimeout(
            () => {
                // verify folder node creation
                let node: TreeNode = IdbFS.makeTreeNode('test');
                expect(IdbFS.isFolderNode(node)).toEqual(true);
                expect(IdbFS.isDataNode(node)).toEqual(false);
                expect(node['parentKey']).toEqual(undefined);
                expect(node['data']).toEqual(undefined);

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
            IT_TIMEOUT_MSEC);
    });
});
