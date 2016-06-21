// Copyright (c) 2016 Tracktunes Inc

import {
    Idb,
    IdbConfig,
    MAX_DB_INIT_TIME
} from './idb';

const DB_CONFIG: IdbConfig = {
    name: 'd',
    version: 1,
    storeConfigs: [
        {
            name: 's',
            indexConfigs: [
                {
                    name: 'name',
                    unique: false
                },
                {
                    name: 'parentKey',
                    unique: false
                },
                {
                    name: 'timestamp',
                    unique: true
                }
            ]
        }
    ]
}

Idb.deleteDb('d');

let idb: Idb =
    new Idb(DB_CONFIG),
    db: IDBDatabase = null,
    item1len: number = 3,
    item2len: number = 5,
    item1: Uint16Array = new Uint16Array(item1len),
    item2: Uint16Array = new Uint16Array(item2len),
    key1: number,
    key2: number;

item1[0] = 1;
item1[1] = 2;
item1[2] = 3;

item2[0] = 11;
item2[1] = 22;
item2[2] = 33;
item2[3] = 44;
item2[4] = 55;

beforeEach((done: Function) => {
    idb.waitForDB().subscribe(
        (database: IDBDatabase) => {
            db = database;
            done();
        },
        (error) => {
            fail(error);
        });
});

jasmine.DEFAULT_TIMEOUT_INTERVAL = MAX_DB_INIT_TIME * 10;

describe('When idb is initialized', () => {
    it('idb is not falsy', (done) => {
        setTimeout(
            () => {
                expect(idb).not.toBeFalsy();
                done();
            },
            MAX_DB_INIT_TIME);
    });

    it('db is not falsy', (done) => {
        setTimeout(
            () => {
                expect(db).not.toBeFalsy();
                done();
            },
            MAX_DB_INIT_TIME);
    });

    it('db validateKey() works as expected', (done) => {
        expect(idb.validateKey(1)).toBeTruthy();
        expect(idb.validateKey(0)).toBeFalsy();
        expect(idb.validateKey(-1)).toBeFalsy();
        expect(idb.validateKey(1.1)).toBeFalsy();
        done();
    });

    it('createStoreItem(item1) returns 1', (done) => {
        setTimeout(
            () => {
                idb.createStoreItem<Uint16Array>('s', item1)
                    .subscribe(
                    (key: number) => {
                        key1 = key;
                        expect(key1).toEqual(1);
                        done();
                    });
            },
            MAX_DB_INIT_TIME);
    });

    it('createStoreItem(item2) returns 2', (done) => {
        setTimeout(
            () => {
                idb.createStoreItem<Uint16Array>('s', item2)
                    .subscribe(
                    (key: number) => {
                        key2 = key;
                        expect(key2).toEqual(2);
                        done();
                    });
            },
            MAX_DB_INIT_TIME);
    });

    it('clears the store', (done) => {
        setTimeout(
            () => {
                idb.clearStore('s').subscribe(
                    () => {
                        done();
                    }
                );
            },
            MAX_DB_INIT_TIME);
    });

    it('createStoreItem(item1) returns 3', (done) => {
        setTimeout(
            () => {
                idb.createStoreItem<Uint16Array>('s', item1)
                    .subscribe(
                    (key: number) => {
                        key1 = key;
                        expect(key1).toEqual(3);
                        done();
                    });
            },
            MAX_DB_INIT_TIME);
    });

    it('createStoreItem(item2) returns 4', (done) => {
        setTimeout(
            () => {
                idb.createStoreItem<Uint16Array>('s', item2)
                    .subscribe(
                    (key: number) => {
                        key2 = key;
                        expect(key2).toEqual(4);
                        done();
                    });
            },
            MAX_DB_INIT_TIME);
    });

    it('readStoreItem(1) returns item1', (done) => {
        setTimeout(
            () => {
                idb.readStoreItem<Uint16Array>(
                    's',
                    key1).subscribe(
                    (result: Uint16Array) => {
                        expect(result.length).toEqual(item1len);
                        expect(result.BYTES_PER_ELEMENT).toEqual(2);
                        done();
                    }
                    );
            },
            MAX_DB_INIT_TIME);
    });

    it('deleteStoreItem(1) works', (done) => {
        setTimeout(
            () => {
                idb.deleteStoreItem('s', key1).subscribe(
                    () => {
                        idb.readStoreItem('s', key1).subscribe(
                            (result: Uint16Array) => {
                                expect(result).toEqual(undefined);
                                done();
                            });
                    });
            },
            MAX_DB_INIT_TIME);
    });

    it('readStoreItem(2) returns item2', (done) => {
        setTimeout(
            () => {
                idb.readStoreItem<Uint16Array>('s', key2).subscribe(
                    (result: Uint16Array) => {
                        expect(result.length).toEqual(item2len);
                        expect(result.BYTES_PER_ELEMENT).toEqual(2);
                        done();
                    }
                );
            },
            MAX_DB_INIT_TIME);
    });

    it('createStoreItem(item1) again returns 5', (done) => {
        setTimeout(
            () => {
                idb.createStoreItem<Uint16Array>('s', item1)
                    .subscribe(
                    (key: number) => {
                        key1 = key;
                        expect(key1).toEqual(5);
                        done();
                    });
            },
            MAX_DB_INIT_TIME);
    });

    it('updateStoreItem(key1, item2) item1 to item2 works', (done) => {
        setTimeout(
            () => {
                idb.updateStoreItem<Uint16Array>('s', key1, item2)
                    .subscribe(
                    () => {
                        // read it after updating ensure length same as item2
                        idb.readStoreItem('s', key1).subscribe(
                            (result: Uint16Array) => {
                                expect(result.length).toEqual(item2len);
                                done();
                            });
                    });
            },
            MAX_DB_INIT_TIME);
    });

    it('updateStoreItem(key2, item1) item2 to item1 works', (done) => {
        setTimeout(
            () => {
                idb.updateStoreItem<Uint16Array>('s', key2, item1)
                    .subscribe(
                    () => {
                        // read it after updating ensure length same as item2
                        idb.readStoreItem('s', key2).subscribe(
                            (result: Uint16Array) => {
                                expect(result.length).toEqual(item1len);
                                done();
                            });
                    });
            },
            MAX_DB_INIT_TIME);
    });

});
