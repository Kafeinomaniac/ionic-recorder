// Copyright (c) 2016 Tracktunes Inc

import {
    IdbFilesystem
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
});
