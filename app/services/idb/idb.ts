// Copyright (c) 2016 Tracktunes Inc

import {
    Observable
} from 'rxjs/Rx';

import {
    positiveWholeNumber
} from '../utils/utils';

// wait time between checks that the db is initialized
const WAIT_FOR_DB_MSEC: number = 60;

interface StoreKeys {
    [storeName: string]: number;
}

interface StoreIndexConfig {
    name: string;
    unique: boolean;
}

interface StoreConfig {
    name: string;
    indexConfigs: StoreIndexConfig[];
}

////////////////////////////////////////////////////////////////////////////////
// START: Public API
////////////////////////////////////////////////////////////////////////////////

/**
 * Delete entire database. Exported global because we may call it
 * before constructing an Idb object.
 * @params {string} dbName - the name of the database to delete
 * @returns {void} We assume the delete just works but we get an
 * error thrown if it does not.
 */
export function deleteDb(dbName: string): void {
    'use strict';
    let request: IDBOpenDBRequest = indexedDB.deleteDatabase(dbName);

    request.onsuccess = function (): void {
        // console.log('deleteDatabase: SUCCESS');
    };

    request.onerror = function (): void {
        console.warn('deleteDatabase: ERROR');
        throw Error('Idb:deleteDb() request error');
    };

    request.onblocked = function (): void {
        console.warn('deleteDatabase: BLOCKED');
        throw Error('Idb:deleteDb() request blocked error');
    };
}

export interface IdbConfig {
    name: string;
    version: number;
    storeConfigs: StoreConfig[];
}

/**
 * @name Idb
 * @description
 * Basic IndexedDB wrapper for setup and CRUD functions with arbitrary objects
 */
export class Idb {
    private db: IDBDatabase;
    private storeKeys: StoreKeys;

    /**
     * @constructor
     */
    constructor(config: IdbConfig) {
        Idb.validateConfig(config);
        console.log('constructor():Idb, name=' + config.name +
            ', version=' + config.version);
        if (typeof window['indexedDB'] === 'undefined') {
            throw new Error('Browser does not support indexedDB');
        }

        this.openDB(config).subscribe(
            (db: IDBDatabase) => {
                this.db = db;
            },
            (error) => {
                console.error('in openDB: ' + error);
            });
    }

    // we make this a static function because it needs to be called
    // before class construction sometimes
    public static validateConfig(config: IdbConfig): IdbConfig {
        'use strict';
        if (typeof config === 'undefined' || !config) {
            throw Error('Falsey DB config');
        }
        if (typeof config['name'] === 'undefined') {
            throw Error('No DB name in DB config');
        }
        if (typeof config['version'] === 'undefined') {
            throw Error('No DB version in DB config');
        }
        if (!positiveWholeNumber(config['version'])) {
            throw Error('Malformed DB version number in DB config');
        }
        if (typeof config['storeConfigs'] === 'undefined' ||
            typeof config['storeConfigs']['length'] === 'undefined' ||
            config.storeConfigs.length === 0) {
            throw Error('No store configs in DB config');
        }
        return config;
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
                    setTimeout(repeat, WAIT_FOR_DB_MSEC);
                }
            };
            repeat();
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
                    observer.error('Idb:clearStore(): ' + error);
                }
            );
        });
        return source;
    }

    // CRUD methods

    /**
     * Create a new item in a db store
     * @param {string} storeName - the name of the db store where we're
     * creating the item
     * @param {T} item - the item we're about to store in the db store
     * @returns {Observable<number>} Observable that emits the item key
     * that was automatically incremented for the newly created (stored) item.
     */
    public create<T>(
        storeName: string,
        item: T
    ): Observable<number> {
        let source: Observable<number> = Observable.create((observer) => {
            if (typeof item !== 'undefined' && item) {
                this.getStore(storeName, 'readwrite').subscribe(
                    (store: IDBObjectStore) => {
                        let key: number = this.storeKeys[storeName],
                            addRequest: IDBRequest = store.add(item, key);

                        addRequest.onsuccess = (event: IDBEvent) => {
                            if (addRequest.result !== key) {
                                observer.error('addRequest key mismatch');
                            }
                            else {
                                this.storeKeys[storeName]++;
                                observer.next(key);
                                observer.complete();
                            }
                        };

                        addRequest.onerror = (event: IDBEvent) => {
                            observer.error('addRequest.onerror ' +
                                event.target);
                        };
                    },
                    (error) => {
                        observer.error('Idb:create(): ' + error);
                    }
                ); // this.getStore(storeName, 'readwrite').subscribe(
            } // if (typeof item !== 'undefined' && item) {
            else {
                observer.error('cannot add falsy item: ' + item);
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
    public read<T>(
        storeName: string,
        key: number
    ): Observable<T> {
        let source: Observable<T> = Observable.create((observer) => {
            if (positiveWholeNumber(key)) {
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
                ); // this.getStore(storeName, 'readonly').subscribe(
            } // if (positiveWholeNumber(key)) {
            else {
                observer.error('invalid key: ' + key);
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
    public update<T>(
        storeName: string,
        key: number,
        newItem: T
    ): Observable<void> {
        let source: Observable<void> = Observable.create((observer) => {
            if (positiveWholeNumber(key)) {
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
                ); // this.getStore(storeName, 'readwrite').subscribe(
            } // if (positiveWholeNumber(key)) {
            else {
                observer.error('invalid key: ' + key);
            }
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
    public delete(
        storeName: string,
        key: number
    ): Observable<void> {
        let source: Observable<void> = Observable.create((observer) => {
            if (positiveWholeNumber(key)) {
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
                ); // this.getStore(storeName, 'readwrite').subscribe(
            } // if (positiveWholeNumber(key)) {
            else {
                observer.error('invalid key: ' + key);
            }
        });
        return source;
    }

    ////////////////////////////////////////////////////////////////////////////
    // END: Public API
    ////////////////////////////////////////////////////////////////////////////

    /**
     * Initialize (find the last key of) all data stores
     * @param {StoreConfig[]} a verified StoreConfig array
     * @param {IDBOpenDBRequest} an open database request object
     * @returns {void}
     */
    private initStoreKeys(
        storeConfigs: StoreConfig[],
        openRequest: IDBOpenDBRequest,
        observer: any
    ): void {
        let nStores: number = storeConfigs.length,
            db: IDBDatabase = openRequest.result,
            errorsFound: boolean = false,
            nCursorsProcessed: number = 0,
            callObserver: () => void = () => {
                if (nCursorsProcessed === nStores) {
                    if (errorsFound) {
                        observer.error('init store error');
                    }
                    else {
                        observer.next(db);
                        observer.complete();
                    }
                }
            };
        this.storeKeys = {};
        storeConfigs.forEach((sConfig: StoreConfig) => {
            let storeName: string = sConfig.name,
                cursorRequest: IDBRequest =
                    db.transaction(storeName, 'readonly')
                        .objectStore(storeName).openCursor(null, 'prev');

            cursorRequest.onsuccess = (event: IDBEvent) => {
                let cursor: IDBCursorWithValue = cursorRequest.result;
                if (cursor) {
                    // add 1 because this.storeKeys always has next key to save
                    this.storeKeys[storeName] = cursor.key + 1;
                }
                else {
                    // no cursor, meaning store is empty
                    this.storeKeys[storeName] = 1;
                }
                nCursorsProcessed++;
                callObserver();
            };

            cursorRequest.onerror = (event: IDBErrorEvent) => {
                errorsFound = true;
                nCursorsProcessed++;
                callObserver();
            };
        });
    }

    /**
     * Create data stores from scratch
     * @param {StoreConfig[]} a verified StoreConfig array
     * @param {IDBOpenDBRequest} an open database request object
     * @returns {void}
     */
    private createStores(
        storeConfigs: StoreConfig[],
        openRequest: IDBOpenDBRequest
    ): void {
        storeConfigs.forEach((sConfig: StoreConfig) => {
            let store: IDBObjectStore =
                openRequest.result.createObjectStore(sConfig.name);
            sConfig.indexConfigs.forEach((iConfig: StoreIndexConfig) => {
                store.createIndex(
                    iConfig.name,
                    iConfig.name,
                    { unique: iConfig.unique });
            });
        });
    }

    /**
     * Open the DB and set it up for use.
     * @returns {Observable<IDBDatabase>} Observable that emits the database
     * when it's ready for use.
     */
    private openDB(config: IdbConfig): Observable<IDBDatabase> {
        let source: Observable<IDBDatabase> = Observable.create((observer) => {
            let openRequest: IDBOpenDBRequest = indexedDB.open(
                config.name, config.version);

            openRequest.onsuccess = (event: Event) => {
                // console.log('indexedDB.open():onsuccess()');
                this.initStoreKeys(config.storeConfigs, openRequest, observer);
            };

            openRequest.onerror = (event: IDBErrorEvent) => {
                observer.error('in openRequest.onerror');
            };

            openRequest.onblocked = (event: IDBErrorEvent) => {
                observer.error('in openRequest.onblocked');
            };

            // This function is called when the database doesn't exist
            openRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                console.log('indexedDB.open():onupgradeended()');
                try {
                    this.createStores(config.storeConfigs, openRequest);
                }
                catch (error) {
                    let ex: DOMException = error;
                    observer.error('in openRequest.onupgradeended: ' +
                        'code=' + ex.code + ' - ' + ex.message);
                }
            }; // openRequest.onupgradeneeded = ..
        });
        return source;
    }

    /**
     * Ask for a specific db store by name (IDBObjectStore)
     * @param {string} storeName - the name of the store to get
     * @param {string} mode - either 'readonly' or 'readwrite'
     * @returns {Observable<IDBObjectStore>} Observable that emits the object
     * store obtained via a DB request, when it's ready for use.
     */
    protected getStore(
        storeName: string,
        mode: string
    ): Observable<IDBObjectStore> {
        let source: Observable<IDBObjectStore> =
            Observable.create((observer) => {
                this.waitForDB().subscribe(
                    (db: IDBDatabase) => {
                        observer.next(db.transaction(
                            storeName,
                            mode
                        ).objectStore(storeName));
                        observer.complete();
                    },
                    (error) => {
                        observer.error('Idb:getStore(): ' + error);
                    }
                ); // this.waitForDB().subscribe(
            });
        return source;
    }
}
