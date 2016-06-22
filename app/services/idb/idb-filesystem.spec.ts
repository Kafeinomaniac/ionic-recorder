// Copyright (c) 2016 Tracktunes Inc

import {
    IdbFilesystem,
    TreeNode
} from './idb-filesystem';

const IT_TIMEOUT_MSEC: number = 60;

let idbFS: IdbFilesystem = new IdbFilesystem(
    'f',
    1,
    'root'
);

IdbFilesystem.deleteDb('f');

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

describe('services/idb:IdbFilesystem', () => {
    it('initializes', (done) => {
        setTimeout(
            () => {
                expect(idbFS).not.toBeFalsy();
                expect(dbFS).not.toBeFalsy();
                done();
            },
            IT_TIMEOUT_MSEC);
    });

    it('can make a folder node', (done) => {
        setTimeout(
            () => {
                // verify folder node creation
                let node: TreeNode = IdbFilesystem.makeTreeNode('test');
                expect(IdbFilesystem.isFolderNode(node)).toEqual(true);
                expect(IdbFilesystem.isDataNode(node)).toEqual(false);
                expect(node['parentKey']).toEqual(undefined);
                expect(node['data']).toEqual(undefined);

                // invalid parentKey tests
                node['parentKey'] = 0;
                try {
                    IdbFilesystem.makeTreeNode('test', 0, 'data');
                }
                catch (error) {
                    expect(error).toEqual('makeTreeNode(): invalid parentKey');
                }
                try {
                    IdbFilesystem.makeTreeNode('test', 1.1, 'data');
                }
                catch (error) {
                    expect(error).toEqual('makeTreeNode(): invalid parentKey');
                }
                try {
                    IdbFilesystem.makeTreeNode('test', Infinity, 'data');
                }
                catch (error) {
                    expect(error).toEqual('makeTreeNode(): invalid parentKey');
                }

                // verify data node creation
                node = IdbFilesystem.makeTreeNode('test', 111, 'data');
                expect(IdbFilesystem.isFolderNode(node)).toEqual(false);
                expect(IdbFilesystem.isDataNode(node)).toEqual(true);
                expect(node.parentKey).toEqual(111);
                expect(node.data).toEqual('data');
                done();
            },
            IT_TIMEOUT_MSEC);
    });
});
