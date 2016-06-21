// Copyright (c) 2016 Tracktunes Inc

import {
    Observable
} from 'rxjs/Rx';

import {
    positiveWholeNumber
} from '../utils/utils';

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

export interface IdbConfig {
    name: string;
    version: number;
    storeConfigs: StoreConfig[];
}

// wait time between checks that the db is initialized
export const WAIT_FOR_DB_MSEC: number = 60;

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
        console.log('constructor():Idb');
        if (typeof window['indexedDB'] === 'undefined') {
            throw new Error('Browser does not support indexedDB');
        }

        this.validateConfig(config);

        this.openDB(config).subscribe(
            (db: IDBDatabase) => {
                this.db = db;
            },
            (error) => {
                console.error('in openDB: ' + error);
            });
    }

    private validateConfig(config: IdbConfig): void {
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
     * Set up data stores and internal data structures related to them.
     * @param {StoreConfig[]} a verified StoreConfig array
     * @param {IDBOpenDBRequest} an open database request object
     * @returns {void}
     */
    private initStores(
        storeConfigs: StoreConfig[],
        openRequest: IDBOpenDBRequest
    ): void {
        let i: number,
            nStoreConfigs: number = storeConfigs.length,
            storeConfig: StoreConfig,
            store: IDBObjectStore;
        this.storeKeys = {};
        for (i = 0; i < nStoreConfigs; i++) {
            storeConfig = storeConfigs[i];
            // initialize key for current store
            this.storeKeys[storeConfig.name] = 1;
            store = openRequest.result.createObjectStore(storeConfig.name);
            let j: number,
                indexConfigs: StoreIndexConfig[] = storeConfig.indexConfigs,
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
        }
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
                    this.initStores(config.storeConfigs, openRequest);
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
                            observer.error('addRequest.onerror');
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
}
