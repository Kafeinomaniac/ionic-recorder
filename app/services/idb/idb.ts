// Copyright (c) 2016 Tracktunes Inc

import {
    Observable
} from 'rxjs/Rx';

interface StoreIndexConfig {
    name: string;
    unique: boolean;
}

interface StoreConfig {
    name: string;
    indexConfigs: StoreIndexConfig[];
}

export interface IdbConfig {
    name: string;
    version: number;
    storeConfigs: StoreConfig[];
}

const STORE_EXISTS_ERROR_CODE: number = 0;

// use MAX_DB_INIT_TIME in setTimeout() calls after
// initializing DB.  This value is the longest we allow
// the DB to initialize.  If DB does not initialize
// under this time (in msec) then some error will occur
export const MAX_DB_INIT_TIME: number = 600;

interface StoreKeys {
    [storeName: string]: number;
}

/**
 * @name LocalDbBaisc
 * @description
 * A tree data structure for storage and traversal and file/folder like
 * functionality (CRUD functions) based on IndexedDB.
 */
export class Idb {
    private db: IDBDatabase;
    private storeKeys: StoreKeys;

    /**
     * @constructor
     */
    constructor(dbConfig: IdbConfig) {
        console.log('constructor():Idb');
        if (!indexedDB) {
            throw new Error('Browser does not support indexedDB');
        }

        this.openDB(
            dbConfig.name,
            dbConfig.version,
            dbConfig.storeConfigs
        ).subscribe(
            (db: IDBDatabase) => {
                this.db = db;
            },
            (error) => {
                console.error('in openDB: ' + error);
            });
    }

    /**
     * Verifies its argument to be a valid key - returns true
     * if key is a whole number > 0, returns false otherwise.
     * @param {number} the key we're verifying
     * @returns {boolean} whether argument is a valid key
     */
    public validateKey(key: number): boolean {
        return (
            key &&
            !isNaN(key) &&
            key > 0 &&
            key === Math.floor(key)
        );
    }

    /**
     * Wait indefinitely until DB is ready for use, via an observable.
     * @returns {Observable<IDBDatabase>} Observable that emits the database
     * when it's ready for use.
     */
    public waitForDB(): Observable<IDBDatabase> {
        // NOTE:this loop should only repeat a handful of times or so
        let source: Observable<IDBDatabase> = Observable.create((observer) => {
            let repeat: () => void = () => {
                if (this.db) {
                    observer.next(this.db);
                    observer.complete();
                }
                else {
                    setTimeout(repeat, MAX_DB_INIT_TIME / 10);
                }
            };
            repeat();
        });
        return source;
    }

    /**
     * Open the DB and set it up for use.
     * @returns {Observable<IDBDatabase>} Observable that emits the database
     * when it's ready for use.
     */
    private openDB(
        dbName: string,
        dbVersion: number,
        storeConfigs: StoreConfig[]
    ): Observable<IDBDatabase> {
        let source: Observable<IDBDatabase> = Observable.create((observer) => {
            let openRequest: IDBOpenDBRequest = indexedDB.open(
                dbName, dbVersion);

            openRequest.onsuccess = (event: Event) => {
                observer.next(openRequest.result);
                observer.complete();
            };

            openRequest.onerror = (event: IDBErrorEvent) => {
                observer.error('in openRequest.onerror');
            };

            openRequest.onblocked = (event: IDBErrorEvent) => {
                observer.error('in openRequest.onblocked');
            };

            // This function is called when the database doesn't exist
            openRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                try {
                    let i: number,
                        nStoreConfigs: number = storeConfigs.length,
                        storeConfig: StoreConfig,
                        store: IDBObjectStore,
                        storeName: string;
                    this.storeKeys = {};
                    for (i = 0; i < nStoreConfigs; i++) {
                        storeConfig = storeConfigs[i];
                        storeName = storeConfig.name;
                        // initialize key for current store
                        this.storeKeys[storeName] = 1;
                        store = openRequest.result.createObjectStore(
                            storeName
                        );
                        let j: number,
                            indexConfigs: StoreIndexConfig[] =
                                storeConfig.indexConfigs,
                            nIndexConfigs: number = indexConfigs.length,
                            indexConfig: StoreIndexConfig;
                        for (j = 0; j < nIndexConfigs; j++) {
                            indexConfig = indexConfigs[j];
                            store.createIndex(
                                indexConfig.name,
                                indexConfig.name,
                                { unique: indexConfig.unique }
                            );
                        }
                    } // for (i = 0; i < nStoreConfigs; i++) {
                }
                catch (error) {
                    let ex: DOMException = error;
                    if (ex.code !== STORE_EXISTS_ERROR_CODE) {
                        // ignore 'store already exists' error
                        observer.error('in openRequest.onupgradeended: ' +
                            ex.message);
                    }
                } // try .. catch ..
                // console.log('openDB:onupgradeended DONE');
            }; // openRequest.onupgradeneeded =
        });
        return source;
    }

    public static deleteDb(dbName: string): void {
        let request: IDBOpenDBRequest = indexedDB.deleteDatabase(dbName);

        request.onsuccess = function (): void {
            // console.log('deleteDatabase: SUCCESS');
        };

        request.onerror = function (): void {
            console.warn('deleteDatabase: ERROR');
        };

        request.onblocked = function (): void {
            console.warn('deleteDatabase: BLOCKED');
        };
    }

    /**
     * Ask for a specific db store by name (IDBObjectStore)
     * @param {string} storeName - the name of the store to get
     * @param {string} mode - either 'readonly' or 'readwrite'
     * @returns {Observable<IDBObjectStore>} Observable that emits the object
     * store obtained via a DB request, when it's ready for use.
     */
    private getStore(
        storeName: string,
        mode: string
    ): Observable<IDBObjectStore> {
        let source: Observable<IDBObjectStore> =
            Observable.create((observer) => {
                this.waitForDB().subscribe(
                    (db: IDBDatabase) => {
                        observer.next(
                            db.transaction(
                                storeName,
                                mode
                            ).objectStore(storeName)
                        );
                        observer.complete();
                    },
                    (error) => {
                        observer.error('in waitForDB: ' + error);
                    }
                ); // waitForDB().subscribe(
            });
        return source;
    }

    /**
     * Completely erases all content of a db store
     * @params {string} storeName - the name of the store to delete
     * @returns {Observable<void>} Obervable that emits when the clear
     * operation is done
     */
    public clearStore(storeName: string): Observable<void> {
        let source: Observable<void> = Observable.create((observer) => {
            this.getStore(storeName, 'readwrite').subscribe(
                (store: IDBObjectStore) => {
                    store.clear();
                    observer.next();
                    observer.complete();
                },
                (error) => {
                    observer.error('in getStore: ' + error);
                }
            ); // getStore().subscribe(
        });
        return source;
    }

    ///////////////////////////////////////////////////////////////////////////
    // CRUD methods
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Create a new item in a db store
     * @param {string} storeName - the name of the db store where we're
     * creating the item
     * @param {T} item - the item we're about to store in the db store
     * @returns {Observable<number>} Observable that emits the item key
     * that was automatically incremented for the newly created (stored) item.
     */
    public createStoreItem<T>(
        storeName: string,
        item: T
    ): Observable<number> {
        let source: Observable<number> = Observable.create((observer) => {
            if (!item) {
                observer.error('cannot add falsy item: ' + item);
            }
            else {
                this.getStore(storeName, 'readwrite').subscribe(
                    (store: IDBObjectStore) => {
                        let key: number = this.storeKeys[storeName],
                            addRequest: IDBRequest = store.add(item, key);
                        addRequest.onsuccess = (event: IDBEvent) => {
                            if (addRequest.result !== key) {
                                observer.error('add key mismatch');
                            }
                            else {
                                this.storeKeys[storeName]++;
                                observer.next(key);
                                observer.complete();
                            }
                        };
                        addRequest.onerror = (event: IDBEvent) => {
                            observer.error('in addRequest.onerror');
                        };
                    },
                    (error) => {
                        observer.error(
                            'in createStoreItem: ' + error
                        );
                    }
                ); // getStore().subscribe(
            }
        });
        return source;
    }

    /**
     * Read an item from a db store via its key
     * @param {string} storeName - the name of the db store from which
     * we're reading the item
     * @param {number} key - the item's key in the db store
     * @returns {Observable<T>} Observable that emits the item as
     * soon as the db read request completes
     */
    public readStoreItem<T>(
        storeName: string,
        key: number
    ): Observable<T> {
        let source: Observable<T> = Observable.create((observer) => {
            if (!this.validateKey(key)) {
                observer.error('invalid key');
            }
            else {
                this.getStore(storeName, 'readonly').subscribe(
                    (store: IDBObjectStore) => {
                        let getRequest: IDBRequest = store.get(key);

                        getRequest.onsuccess = (event: IDBEvent) => {
                            // we return success even if not found
                            // but in that case return a falsy value
                            // otherwise return node on success
                            observer.next(getRequest.result);
                            observer.complete();
                        };

                        getRequest.onerror = (event: IDBErrorEvent) => {
                            observer.error('in getRequest.onerror');
                        };
                    },
                    (error) => {
                        observer.error('in getStore: ' + error);
                    }
                ); // getStore().subscribe(
            }
        });
        return source;
    }

    /**
     * Update an item already in a db store with new values
     * @param {string} storeName - the name of the db store where the
     * existing item to update is
     * @param {number} key - the key of the item to update in the db store
     * @param {T} newItem - the item, containing new values, which is going
     * to replace existing item in the db store
     * @returns {Observable<void>} Observable that emits after update ends
     */
    public updateStoreItem<T>(
        storeName: string,
        key: number,
        newItem: T
    ): Observable<void> {
        let source: Observable<void> = Observable.create((observer) => {
            if (!this.validateKey(key)) {
                observer.error('invalid key: ' + key);
            }
            else {
                this.getStore(storeName, 'readwrite').subscribe(
                    (store: IDBObjectStore) => {
                        let getRequest: IDBRequest = store.get(key);
                        getRequest.onsuccess = (event: IDBEvent) => {
                            if (!getRequest.result) {
                                // request success, but we got nothing. ERROR:
                                // we expect what we're updating to be there
                                observer.error('no result to update');
                            }
                            else {
                                let putRequest: IDBRequest = store.put(
                                    newItem,
                                    key
                                );
                                putRequest.onsuccess =
                                    (errorEvent: IDBErrorEvent) => {
                                        // the key of the updated item is in
                                        // putRequest.result, verify it
                                        if (putRequest.result !== key) {
                                            observer.error('bad key in put: ' +
                                                putRequest.result);
                                        }
                                        else {
                                            observer.next();
                                            observer.complete();
                                        }
                                    };
                                putRequest.onerror =
                                    (errorEvent: IDBErrorEvent) => {
                                        observer.error('put request');
                                    };
                            }
                        }; // getRequest.onsuccess =

                        getRequest.onerror = (event: IDBErrorEvent) => {
                            observer.error('get request 2');
                        };
                    },
                    (getStoreError) => {
                        observer.error(getStoreError);
                    }
                ); // getStore().subscribe(
            } // if (!this.validateKey(key)) { .. else {
        });
        return source;
    }

    /**
     * Delete an item already in a db store from the store
     * @param {string} storeName - the name of the db store where the
     * existing item to delete is
     * @param {number} key - the key of the item to delete in the db store
     * @returns {Observable<void>} Observable that emits after delete ends
     */
    public deleteStoreItem(
        storeName: string,
        key: number
    ): Observable<void> {
        let source: Observable<void> = Observable.create((observer) => {
            this.getStore(storeName, 'readwrite').subscribe(
                (store: IDBObjectStore) => {
                    let deleteRequest: IDBRequest = store.delete(key);

                    deleteRequest.onsuccess = (event: IDBEvent) => {
                        observer.next();
                        observer.complete();
                    };

                    deleteRequest.onerror = (event: IDBErrorEvent) => {
                        observer.error('delete request');
                    };
                },
                (error) => {
                    observer.error(error);
                }
            ); // getStore().subscribe(
        });
        return source;
    }
}
