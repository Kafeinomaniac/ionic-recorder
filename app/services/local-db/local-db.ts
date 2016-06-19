// Copyright (c) 2016 Tracktunes Inc

import {
    Injectable
} from '@angular/core';

import {
    Observable
} from 'rxjs/Rx';

// non-exported module globals

const DB_VERSION: number = 2;

const DB_TREE_STORE_NAME: string = 'blobTree';

const DB_DATA_STORE_NAME: string = 'dataTable';

const STORE_EXISTS_ERROR_CODE: number = 0;

// module exports

// use MAX_DB_INIT_TIME in setTimeout() calls after
// initializing DB.  This value is the longest we allow
// the DB to initialize.  If DB does not initialize
// under this time (in msec) then some error will occur
export const MAX_DB_INIT_TIME: number = 600;

export const DB_NAME: string = 'ionic-recorder-db';

export const DB_NO_KEY: number = 0;

// NB: DB_KEY_PATH must be an optional field in both these interfaces
export const DB_KEY_PATH: string = 'id';

// helper functions

export function copyFromObject(src: Object, dest: Object): Object {
    'use strict';
    for (let i in src) {
        if (src.hasOwnProperty(i)) {
            dest[i] = src[i];
        }
    }
    return dest;
}

export function prependArray(value: any, arr: any[]): any[] {
    'use strict';
    let newArray: any[] = arr.slice(0);
    newArray.unshift(value);
    return newArray;
}

export interface DataNode {
    data: any;
}

export interface TreeNode {
    name: string;
    parentKey: number;
    dataKey: number;
    timestamp: number;
    childOrder?: number[];
    path?: string;
}

export interface ParentChild {
    parent: TreeNode;
    child: TreeNode;
    data?: DataNode;
}

/**
 * @name LocalDB
 * @description
 * A tree data structure for storage and traversal and file/folder like
 * functionality (CRUD functions) based on IndexedDB.
 */
@Injectable()
export class LocalDB {
    private db: IDBDatabase;

    /**
     * @constructor
     */
    constructor() {
        console.log('constructor():LocalDB');
        if (!indexedDB) {
            throw new Error('Browser does not support indexedDB');
        }
        this.openDB().subscribe(
            (db: IDBDatabase) => {
                this.db = db;
            },
            (error: any) => {
                console.error('in openDB: ' + error);
            }
        );
    }

    /**
     * Verifies its argument to be a valid LocalDB key - returns true
     * if key is a whole number > 0, returns false otherwise.
     * @param {number} the key we're verifying
     * @returns {boolean} whether argument is a valid LocalDB key
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
     * Creates a DataNode (only make new DataNodes via this function)
     * NB: there are two kinds of "data node" in thise code - one is in the
     * data store (this one) and is of type DataNode and is what we refer to
     * as a "data node". The other kind of data node in this code is the tree
     * node data node (a TreeNode can have either a folder node or a data
     * node) - we call that one a "TreeNode data node". This data node is the
     * low-level one, the one containing actual data (TreeNode data nodes point
     * to a data node and don't actually contain any data, to allow loading
     * large portions of the tree without the data).
     * @param {any} data that goes into the newly created DataNode
     * @returns {DataNode} newly created data node
     */
    // always returns an object with a 'data' field (a DataNode)
    public makeDataNode(newData: any): DataNode {
        if (typeof newData === 'object' && newData.data) {
            return newData;
        }
        else {
            return {
                data: newData
            };
        }
    }

    /**
     * Creates a new TreeNode (only make new TreeNodes via this function).
     * There are two kinds of TreeNode: a data TreeNode and a folder TreeNode.
     * This function creates either one, depending on how you provide dataKey.
     * If dataKey is DB_NO_KEY, this function creates a folder TreeNode. If
     * dataKey points to an actually created data node (created with
     * makeDataNode) then this function creates a data TreeNode.
     * @param {string} name - new TreeNode's name
     * @param {number} parentKey - key of the parent node in the tree
     * @param {number} dataKey - key of the data node (if this is a data node
     * in the tree, otherwise set dataKey to be DB_NO_KEY to signify this is
     * a folder TreeNode we're creating).
     * @returns {DataNode} newly created data node
     */
    public makeTreeNode(
        name: string,
        parentKey: number,
        dataKey: number
    ): TreeNode {
        let treeNode: TreeNode = {
            name: name,
            parentKey: parentKey,
            dataKey: dataKey,
            timestamp: Date.now()
        };
        // making dataKey any invalid key is how we signal to makeTreeNode
        // that we're making a folder node
        if (this.isFolderNode(treeNode)) {
            treeNode.childOrder = [];
        }
        return treeNode;
    };

    /**
     * Create a ParentChild object from two TreeNodes - the parent TreeNode
     * and the child TreeNode.
     * @param {TreeNode} parentNode - the parent TreeNode
     * @param {TreeNode} childNode - the child TreeNode
     * @param {dataNode?} dataNode - if child TreeNode is a data TreeNode,
     * supply this as its corresponding data node.
     * @returns {ParentChild}
     */
    private makeParentChild(
        parentNode: TreeNode,
        childNode: TreeNode,
        dataNode?: DataNode
    ): ParentChild {
        let pc: ParentChild = {
            parent: parentNode,
            child: childNode
        };
        if (dataNode) {
            pc.data = dataNode;
        }
        return pc;
    }

    /**
     * Wait indefinitely until DB is ready for use, via an observable.
     * @returns {Observable<IDBDatabase>} Observable that emits the database
     * when it's ready for use.
     */
    public waitForDB(): Observable<IDBDatabase> {
        // NOTE: MAX_DB_INIT_TIME / 10
        // Check in the console how many times we loop here -
        // it shouldn't be much more than a handful
        let source: Observable<IDBDatabase> = Observable.create((observer) => {
            let repeat: () => void = () => {
                if (this.db) {
                    observer.next(this.db);
                    observer.complete();
                }
                else {
                    // console.warn('... no DB yet ...');
                    setTimeout(repeat, MAX_DB_INIT_TIME / 10);
                }
            };
            repeat();
        });
        return source;
    }

    /**
     * Open the DB and set it up for use. This is the schema, essentially.
     * @returns {Observable<IDBDatabase>} Observable that emits the database
     * when it's ready for use.
     */
    private openDB(): Observable<IDBDatabase> {
        let source: Observable<IDBDatabase> = Observable.create((observer) => {
            let openRequest: IDBOpenDBRequest = indexedDB.open(
                DB_NAME, DB_VERSION);

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
                    let treeStore: IDBObjectStore =
                        openRequest.result.createObjectStore(
                            DB_TREE_STORE_NAME,
                            { keyPath: DB_KEY_PATH, autoIncrement: true }
                        );

                    // index on name, parentKey and timestamp
                    treeStore.createIndex(
                        'name', 'name', { unique: false });
                    treeStore.createIndex(
                        'parentKey', 'parentKey', { unique: false });
                    treeStore.createIndex(
                        'timestamp', 'timestamp', { unique: true });

                    // create internal data-table store
                    openRequest.result.createObjectStore(
                        DB_DATA_STORE_NAME,
                        { keyPath: DB_KEY_PATH, autoIncrement: true }
                    );
                }
                catch (error) {
                    let ex: DOMException = error;
                    if (ex.code !== STORE_EXISTS_ERROR_CODE) {
                        // ignore 'store already exists' error
                        observer.error('in openRequest.onupgradeended: ' +
                            ex.message);
                    }
                } // try .. catch ..
                console.log('openDB:onupgradeended DONE');
            }; // openRequest.onupgradeneeded =
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
    // START: generic low-level CRUD methods
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Create a new item in a db store
     * @param {string} storeName - the name of the db store where we're
     * creating the item
     * @param {any} item - the item we're about to store in the db store
     * @returns {Observable<number>} Observable that emits the item key
     * that was automatically incremented for the newly created (stored) item.
     */
    private createStoreItemReturningKey(
        storeName: string,
        item: any
    ): Observable<any> {
        let source: Observable<number> = Observable.create((observer) => {
            if (!item) {
                observer.error('Cannot add falsy item');
            }
            else if (item[DB_KEY_PATH]) {
                observer.error('Cannot create store item with property "' +
                    DB_KEY_PATH + '"');
            }
            else {
                this.getStore(storeName, 'readwrite').subscribe(
                    (store: IDBObjectStore) => {
                        let addRequest: IDBRequest = store.add(item);
                        addRequest.onsuccess = (event: IDBEvent) => {
                            observer.next(addRequest.result);
                            observer.complete();
                        };
                        addRequest.onerror = (event: IDBEvent) => {
                            observer.error('in addRequest.onerror');
                        };
                    },
                    (error) => {
                        observer.error(
                            'in createStoreItemReturningKey: ' + error
                        );
                    }
                ); // getStore().subscribe(
            }
        });
        return source;
    }

    /**
     * Create a new item in a db store
     * @param {string} storeName - the name of the db store where we're
     * creating the item
     * @param {any} item - the item we're about to store in the db store
     * @returns {Observable<any>} Observable that emits the item (same
     * as 'item'  input argument, but it will have a DB_KEY_PATH property
     * that has the correct key in the store where it was created)
     */
    private createStoreItem(storeName: string, item: any): Observable<any> {
        let source: Observable<any> = Observable.create((observer) => {
            this.createStoreItemReturningKey(storeName, item).subscribe(
                (key: number) => {
                    item[DB_KEY_PATH] = key;
                    observer.next(item);
                    observer.complete();
                },
                (error) => {
                    observer.error('in createStoreItem: ' + error);
                }
            ); // getStore().subscribe(
        });
        return source;
    }

    /**
     * Read an item from a db store via its key
     * @param {string} storeName - the name of the db store from which
     * we're reading the item
     * @param {number} key - the item's key in the db store
     * @returns {Observable<any>} Observable that emits the item as
     * soon as the db read request completes
     */
    private readStoreItem(storeName: string, key: number): Observable<any> {
        let source: Observable<any> = Observable.create((observer) => {
            if (!this.validateKey(key)) {
                observer.error('invalid key');
            }
            else {
                this.getStore(storeName, 'readonly').subscribe(
                    (store: IDBObjectStore) => {
                        let getRequest: IDBRequest = store.get(key);

                        getRequest.onsuccess = (event: IDBEvent) => {
                            let mismatchOccured: boolean = false;
                            if (getRequest.result) {
                                // getRequest.result is node we got from db
                                // test for key mismatch or tag on the key
                                if (getRequest.result.hasOwnProperty[
                                    DB_KEY_PATH]) {
                                    if (getRequest[DB_KEY_PATH] !== key) {
                                        mismatchOccured = true;
                                    }
                                }
                                else {
                                    getRequest[DB_KEY_PATH] = key;
                                }
                            } // if getRequest.result
                            if (mismatchOccured) {
                                observer.error('key mismatch');
                            }
                            else {
                                // we return success even if not found
                                // but in that case return a falsy value
                                // otherwise return node on success
                                observer.next(getRequest.result);
                                observer.complete();
                            }
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
     * @param {any} newItem - the item, containing new values, which is going
     * to replace existing item in the db store
     * @returns {Observable<void>} Observable that emits after update ends
     */
    private updateStoreItem(
        storeName: string,
        key: number,
        newItem: any
    ): Observable<any> {
        let source: Observable<void> = Observable.create((observer) => {
            if (!this.validateKey(key)) {
                observer.error('invalid key');
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
                                    copyFromObject(
                                        newItem,
                                        getRequest.result
                                    ));
                                putRequest.onsuccess =
                                    (errorEvent: IDBErrorEvent) => {
                                        // the key of the updated item is in
                                        // putRequest.result, verify it
                                        if (putRequest.result !== key) {
                                            observer.error('bad key in put');
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
    private deleteStoreItem(
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

    ///////////////////////////////////////////////////////////////////////////
    // END: generic low-level CRUD methods
    ///////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////
    // START: TreeStore / DataStore methods
    ///////////////////////////////////////////////////////////////////////////

    // Returns Observable<DataNode> of data store item created, it has key
    // set on it to the new key assigned to it by the databse
    private createDataStoreItem(data: any): Observable<DataNode> {
        let source: Observable<DataNode> = Observable.create((observer) => {
            this.createStoreItem(DB_DATA_STORE_NAME, this.makeDataNode(data))
                .subscribe(
                (dataNode: DataNode) => {
                    observer.next(dataNode);
                    observer.complete();
                },
                (error) => {
                    observer.error(error);
                }
                ); // this.createStoreItem().subscribe(
        });
        return source;
    }

    // Returns Observable<TreeNode> of tree node created, it has key
    // set on it to the new key assigned to it by the databse
    private createTreeStoreItem(
        name: string,
        parentKey: number,
        dataKey: number
    ): Observable<TreeNode> {
        let source: Observable<TreeNode> = Observable.create((observer) => {
            this.createStoreItem(
                DB_TREE_STORE_NAME,
                this.makeTreeNode(name, parentKey, dataKey)).subscribe(
                (treeNode: TreeNode) => {
                    observer.next(treeNode);
                    observer.complete();
                },
                (error) => {
                    observer.error(error);
                }
                ); // this.createStoreItem().subscribe(
        });
        return source;
    }

    // Returns an Observable<void> of success in deleting item
    private deleteDataStoreItem(key: number): Observable<void> {
        return this.deleteStoreItem(DB_DATA_STORE_NAME, key);
    }

    // Returns an Observable<void> of success in deleting item
    private deleteTreeStoreItem(key: number): Observable<void> {
        return this.deleteStoreItem(DB_TREE_STORE_NAME, key);
    }

    ///////////////////////////////////////////////////////////////////////////
    // END: TreeStore / DataStore methods
    ///////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////
    // START: TreeNode methods - low level
    ///////////////////////////////////////////////////////////////////////////

    // Returns an Observable<ParentChild> of new child node created and
    // its associated parent node, whose child order has been updated
    // verifies name is unique among siblings in parent
    public createNode(
        name: string,
        parentKey: number,
        data?: any
    ): Observable<ParentChild> {
        if (data) {
            return this.createDataNode(name, parentKey, data);
        }
        else {
            return this.createFolderNode(name, parentKey);
        }
    }

    // Returns an Observable<TreeNode[]> of all nodes obtained by name
    // regardless of where they are in the tree - this is a way to use
    // the tree as a key/value pair, by the way: just put the key in
    // name and the value goes in the data object of the node.  If nodes
    // by name 'name' exist under any parent, returns []
    private readNodesByName(name: string): Observable<TreeNode[]> {
        let source: Observable<TreeNode[]> = Observable.create((observer) => {
            let nodes: TreeNode[] = [];
            this.getStore(DB_TREE_STORE_NAME, 'readonly').subscribe(
                (store: IDBObjectStore) => {
                    let index: IDBIndex = store.index('name'),
                        keyRange: IDBKeyRange = IDBKeyRange.only(name),
                        cursorRequest: IDBRequest = index.openCursor(keyRange);

                    cursorRequest.onsuccess = (event: IDBEvent) => {
                        let cursor: IDBCursorWithValue = cursorRequest.result;
                        if (cursor) {
                            nodes.push(cursor.value);
                            cursor.continue();
                        }
                        else {
                            observer.next(nodes);
                            observer.complete();
                        }
                    };
                    cursorRequest.onerror = (event: IDBErrorEvent) => {
                        observer.error('cursor 1');
                    };
                },
                (error) => {
                    observer.error(error);
                }
            ); // this.getStore(DB_TREE_STORE_NAME, 'readonly').subscribe(
        });
        return source;
    }

    // Returns an Observable<TreeNode> of node read by name 'name'
    // in parent folder whose key is 'parentKey'.  If such a node does
    // not exist the TreeNode object returned is null.
    private getNodeByNameInParent(
        name: string,
        parentKey: number
    ): Observable<TreeNode> {
        console.warn('getNodeByNameInParent(' + name + ', ' + parentKey + ')');
        let source: Observable<TreeNode> = Observable.create((observer) => {
            this.readNodesByName(name).subscribe(
                (nodes: TreeNode[]) => {
                    let nodeFound: TreeNode = null,
                        nFound: number = 0,
                        i: number;
                    for (i = 0; i < nodes.length; i++) {
                        if (nodes[i].parentKey === parentKey) {
                            nodeFound = nodes[i];
                            nFound++;
                            if (nFound > 1) {
                                break;
                            }
                        }
                    }
                    if (nFound > 1) {
                        observer.error('unique name violation 1 - found ' +
                            nFound + ' of name: ' + name);
                    }
                    else {
                        observer.next(nodeFound);
                        observer.complete();
                    }
                },
                (error) => {
                    observer.error('in readNodesByname: ' + error);
                }
            ); // readNodesByName().subscribe(
        });
        return source;
    }

    // Returns an Observable<DataNode> of data store item 'data' field value
    public readNodeData(treeNode: TreeNode): Observable<DataNode> {
        let source: Observable<DataNode> = Observable.create((observer) => {
            this.readStoreItem(DB_DATA_STORE_NAME, treeNode.dataKey).subscribe(
                (dataNode: DataNode) => {
                    // assume data is an object and tag data store key onto it
                    if (dataNode[DB_KEY_PATH] !== treeNode.dataKey) {
                        observer.error('data store key mismatch ' +
                            dataNode[DB_KEY_PATH] + ' vs. ' +
                            treeNode.dataKey
                        );
                    }
                    else {
                        observer.next(dataNode);
                        observer.complete();
                    }
                },
                (error) => {
                    observer.error('in readStoreItem: ' + error);
                }
            ); // this.readStoreItem().subscribe(
        });
        return source;
    }

    /**
     * @param {number[]} nodeKeys an array of node keys
     * @returns {Observable<TreeNode[]>} observable of an array of TreeNode
     * objects whose ids are in nodeKeys
     */
    private readNodesById(nodeKeys: number[]): Observable<TreeNode[]> {
        let source: Observable<TreeNode[]> = Observable.create((observer) => {
            let childNodes: TreeNode[] = [];
            // asynchronously read childOrder array  nodes, emits TreeNode[]
            this.ls(nodeKeys).subscribe(
                (node: TreeNode) => {
                    childNodes.push(node);
                },
                (error: any) => {
                    observer.error(error);
                },
                () => {
                    observer.next(childNodes);
                    observer.complete();
                }
            );
        });
        return source;
    }

    /**
     * @param {TreeNode} parent node
     * @returns {Observable<TreeNode[]>} observable of an array of TreeNode
     * objects whose ids are children of parentNode
     */
    public readChildNodes(parentNode: TreeNode): Observable<TreeNode[]> {
        return this.readNodesById(parentNode.childOrder);
    }

    // returns observable of parent node (updated with new child order)
    private attachToParent(childNode: TreeNode): Observable<TreeNode> {
        let source: Observable<TreeNode> = Observable.create((observer) => {
            if (this.validateKey(childNode.parentKey)) {
                // you have to read the existing child order first,
                // in order to add to the front of it
                this.readNode(childNode.parentKey).subscribe(
                    (parentNode: TreeNode) => {
                        // push newly created nodes to the front of
                        // the parent childOrder list
                        parentNode.childOrder = prependArray(
                            childNode[DB_KEY_PATH],
                            parentNode.childOrder);
                        // now you update the node with new childOrder
                        this.updateNode(parentNode).subscribe(
                            () => {
                                // update childNode's path
                                if (this.isFolderNode(childNode)) {
                                    childNode.path = parentNode.path + '/' +
                                        parentNode.name;
                                    this.updateNode(childNode).subscribe(
                                        () => {
                                            observer.next(parentNode);
                                            observer.complete();
                                        },
                                        (error: any) => {
                                            observer.error(error);
                                        }
                                    ); // updateNode(childNode).subscribe(
                                }
                                else {
                                    // non-folder node, not updating path
                                    observer.next(parentNode);
                                    observer.complete();
                                }
                            },
                            (error: any) => {
                                observer.error(error);
                            }
                        ); // updateNode().subscribe(
                    },
                    (error: any) => {
                        observer.error(error);
                    }
                ); // readNode().subscribe(
            }
            else {
                // parent key is invalid, return null
                // invalid parent key is how we signal this
                // function that we're creating an item/folder
                // at the forest floor - we're not inside any
                // folder.  this means the path is '/', set it
                // for folders, because they require a path, we
                // automatically track it for folders ...
                // update childNode's path
                if (this.isFolderNode(childNode)) {
                    childNode.path = '';
                    this.updateNode(childNode).subscribe(
                        () => {
                            observer.next(null);
                            observer.complete();
                        },
                        (error: any) => {
                            observer.error(error);
                        }
                    ); // updateNode(childNode).subscribe(
                }
                else {
                    // non-folder node, not updating path
                    observer.next(null);
                    observer.complete();
                }
            }
        });
        return source;
    }

    private detachNodesFromParent(
        childNodes: TreeNode[]
    ): Observable<TreeNode> {
        let source: Observable<TreeNode> = Observable.create((observer) => {
            let nNodes: number = childNodes.length;
            if (nNodes === 0) {
                // verify that some nodes were supplied
                observer.error('called detach with empty list');
            }
            else {
                // verify all nodes have the same parent
                let parentKey: number = childNodes[0].parentKey;
                if (childNodes.filter(x => x.parentKey === parentKey).length
                    !== nNodes) {
                    observer.error('not all children have same parent');
                }
                else {
                    this.readNode(parentKey).subscribe(
                        (parentNode: TreeNode) => {
                            let i: number,
                                childOrder: number[] = parentNode.childOrder,
                                childIndex: number = -1,
                                childKey: number,
                                errorFound: boolean;
                            for (i = 0; i < nNodes; i++) {
                                childKey = childNodes[i][DB_KEY_PATH];
                                childIndex = childOrder.indexOf(childKey);
                                if (childIndex === -1) {
                                    errorFound = true;
                                    break;
                                }
                                else {
                                    // shorten parent's childOrder
                                    childOrder.splice(childIndex, 1);
                                }
                            }
                            if (errorFound) {
                                observer.error('child not in parent!');
                            }
                            else {
                                parentNode.childOrder = childOrder;
                                // now you update the node with new childOrder
                                this.updateNode(parentNode).subscribe(
                                    () => {
                                        observer.next(parentNode);
                                        observer.complete();
                                    },
                                    (error: any) => {
                                        observer.error(error);
                                    }
                                ); // updateNode().subscribe(
                            }
                        },
                        (error: any) => {
                            observer.error(error);
                        }
                    ); // readNode().subscribe(
                }
            }
        });
        return source;
    }

    private detachNodesFromParents(nodes: TreeNode[]): Observable<void> {
        let source: Observable<void> = Observable.create((observer) => {
            // 1) group parents
            let i: number,
                childNode: TreeNode,
                nNodes: number = nodes.length,
                parentsDetachers: { [id: string]: TreeNode[] } = {};
            for (i = 0; i < nNodes; i++) {
                childNode = nodes[i];
                if (!this.validateKey(childNode.parentKey)) {
                    // this child has no parent so skip it.  an example of a
                    // child that has no parents is a folder created at the
                    // root level
                    continue;
                }
                if (!parentsDetachers[childNode.parentKey]) {
                    parentsDetachers[childNode.parentKey] = [childNode];
                }
                else {
                    parentsDetachers[childNode.parentKey].push(childNode);
                }
            }
            // 2) go through parents, fix'em up (childOrder fix)
            // read parents one by one, fix them one by one,
            // update them one by one - there is no reason to do
            // things in batch here because there is nothing that can
            // be done more efficiently in batch here anyway
            let parentKeys: string[] = Object.keys(parentsDetachers),
                nParents: number = parentKeys.length,
                nParentsProcessed: number = 0;

            // it is possible, with the filtering (of child nodes at root)
            // done above, that there is no parent to detach from ...
            if (nParents) {
                for (i = 0; i < nParents; i++) {
                    // INV: parentsDetachers[parentKeys[i]] is always
                    // going to be a non empty array
                    this.detachNodesFromParent(parentsDetachers[parentKeys[i]])
                        .subscribe(
                        () => {
                            nParentsProcessed++;
                            if (nParentsProcessed === nParents) {
                                observer.next();
                                observer.complete();
                            }
                        },
                        (error: any) => {
                            observer.error(error);
                        }
                        );
                } // for
            }
            else {
                observer.next();
                observer.complete();
            }
        });

        return source;
    }

    ///////////////////////////////////////////////////////////////////////////
    // END: TreeNode methods - low level
    ///////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////
    // START: TreeNode methods - HIGH LEVEL API
    //
    // These are the only functions you should be using
    //
    // Main data structures: TreeNode
    //
    // There is one tree. TreeNode is a node in it.  It is either a data
    // node or a folder node, in which case it can contain other nodes.
    // Data nodes are TreeNode objects whose dataKey points to real data
    // in the data store (no data is stored in the tree store).
    //
    // Public high level API functions, obtained via this command:
    //
    // > grep localDB\. `findword 'localDB.' | grep -v local-db` | \
    //   sed 's/.*ocalDB\.*' | sed 's/(.**' | sort -u | nl
    //   1     createDataNode
    //   2     createFolderNode
    //   3     deleteNodes
    //   4     isFolderNode
    //   5     readChildNodes
    //   6     readNode
    //   7     readNodeData
    //   8     readOrCreateDataNode
    //   9     readOrCreateFolderNode
    //   10    updateNodeData
    //   11    validateKey
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Creates a data TreeNode in a parent (folder TreeNode) by key, returning
     * the parent
     * @param {string} name - the name of the new node
     * @param {number} parentKey - db store key of parent folder TreeNode
     * @param {any} data - the data node
     * @returns {Observable<ParentChild>} Parent and child nodes, child is the
     * newly created data node with DB_KEY_PATH property having its id set and
     * parent is the parent node that contains it.
     */
    public createDataNode(
        name: string,
        parentKey: number,
        data: any
    ): Observable<ParentChild> {
        let source: Observable<ParentChild> = Observable.create((observer) => {
            // non falsy data supplied, store it in the data table first
            this.getNodeByNameInParent(name, parentKey)
                .subscribe(
                (nodeInParent: TreeNode) => {
                    if (!nodeInParent) {
                        // data node does not yet exist in parent, create it
                        this.createDataStoreItem(data).subscribe(
                            (dataNode: DataNode) => {
                                // now that we've created a data store item to
                                // store the actual data, create the data node
                                // in the tree store that points to data store
                                // this is a data node
                                this.createTreeStoreItem(
                                    name,
                                    parentKey,
                                    dataNode[DB_KEY_PATH]).subscribe(
                                    (childNode: TreeNode) => {
                                        // now we need to update the parent
                                        // node child order by prepending.
                                        // first, we'll have to read the
                                        // parent child order, then we'll
                                        // modify it, then we'll have to call
                                        // update on the parent.  only do this
                                        // if the parent exists, of course
                                        this.attachToParent(childNode)
                                            .subscribe(
                                            (parentNode: TreeNode) => {
                                                observer.next(
                                                    this.makeParentChild(
                                                        parentNode,
                                                        childNode
                                                    ));
                                                observer.complete();
                                            },
                                            (error: any) => {
                                                observer.error(error);
                                            }
                                            ); // attachToParent.subscribe(
                                    },
                                    (error: any) => {
                                        observer.error(
                                            'in createTreeStoreItem:' + error);
                                    }
                                    ); // createTreeStoreItem().subscribe(
                            },
                            (error: any) => {
                                observer.error(
                                    'in createDataStoreItem:' + error);
                            }
                        ); // createDataStoreItem().subscribe(
                    } // if (!nodeInParent)
                    else {
                        observer.error('unique name violation 2');
                    }
                },
                (error) => {
                    observer.error('in getNodeByNameInParent: ' + error);
                }
                ); // getNodeByNameInParent().subscribe(
        });
        return source;
    }

    /**
     * Creates a folder TreeNode in a parent (folder TreeNode) by key
     * @param {string} name - the name of the new node
     * @param {number} parentKey - db store key of parent folder TreeNode
     * @returns {Observable<ParentChild>} Parent and child nodes, child is the
     * newly created data node with DB_KEY_PATH property having its id set and
     * parent is the parent node that contains it. In the newly created parent
     * node, the child order has been updated, verifies name is unique among
     * siblings.
     */
    public createFolderNode(
        name: string,
        parentKey: number
    ): Observable<ParentChild> {
        console.log('createFolderNode(' + name + ', ' + parentKey + ')');
        let source: Observable<ParentChild> =
            Observable.create((observer) => {
                this.getNodeByNameInParent(name, parentKey).subscribe(
                    (nodeInParent: TreeNode) => {
                        if (nodeInParent) {
                            observer.error('unique name violation 3');
                        }
                        else {
                            this.createTreeStoreItem(name, parentKey, DB_NO_KEY)
                                .subscribe(
                                (childNode: TreeNode) => {
                                    // now we need to update the parent
                                    // node child order by prepending.
                                    // first, we'll have to read the
                                    // parent child order, then we'll
                                    // modify it, then we'll have to call
                                    // update on the parent.  only do this
                                    // if the parent exists, of course
                                    this.attachToParent(childNode).subscribe(
                                        (parentNode: TreeNode) => {
                                            observer.next(
                                                this.makeParentChild(
                                                    parentNode,
                                                    childNode
                                                ));
                                            observer.complete();
                                        },
                                        (error: any) => {
                                            observer.error(error);
                                        }
                                    ); // attachToParent().subscribe(
                                },
                                (error) => {
                                    observer.error(
                                        'in createTreeStoreItem:' + error);
                                }
                                ); // createTreeStoreItem().subscribe(
                        } // if (nodeInParent) { .. } else { .. }
                    },
                    (error) => {
                        observer.error('in getNodeByNameInParent: ' + error);
                    }
                ); // getNodeByNameInParent().subscribe(
            });
        return source;
    }

    /**
     * Delete a collection of unique TreeNodes provided as a dictionary
     * @param {[id: string]: TreeNode} keyDict - collection of unique TreeNodes
     * @returns {Observable<void>} - observable that emits after deletion has
     * completed successfully
     */
    public deleteNodes(
        keyDict: { [id: string]: TreeNode; }
    ): Observable<void> {
        let source: Observable<void> = Observable.create((observer) => {
            this.detachForDeleteNodes(keyDict).subscribe(
                (detachedKeyDict: Object) => {
                    let i: number,
                        keys: string[] = Object.keys(detachedKeyDict),
                        nNodes: number = keys.length,
                        node: TreeNode,
                        nDeleted: number = 0;
                    // delete
                    for (i = 0; i < nNodes; i++) {
                        node = keyDict[keys[i]];
                        this.deleteNode(node).subscribe(
                            () => {
                                nDeleted++;
                                if (nDeleted === nNodes) {
                                    observer.next();
                                    observer.complete();
                                }
                            },
                            (error: any) => {
                                observer.error(error);
                            }
                        );
                    }
                }
            );
        });
        return source;
    }

    /**
     * Checks whether a given TreeNode is a data node
     * @param {TreeNode} node to check
     * @returns {boolean} whether the argument is a data node
     */
    public isDataNode(node: TreeNode): boolean {
        return this.validateKey(node.dataKey);
    }

    /**
     * Checks whether a given TreeNode is a folder node
     * @param {TreeNode} node to check
     * @returns {boolean} whether the argument is a folder node
     */
    public isFolderNode(node: TreeNode): boolean {
        return !this.isDataNode(node);
    }

    /**
     * Reads a node into memory from db, by key
     * @param {number} key - the key of the node to read from db
     * @returns {Observable<TreeNode>} an observable that emits the
     * TreeNode read.
     */
    public readNode(key: number): Observable<TreeNode> {
        let source: Observable<TreeNode> = Observable.create((observer) => {
            this.readStoreItem(DB_TREE_STORE_NAME, key).subscribe(
                (treeNode: TreeNode) => {
                    if (treeNode === undefined || !treeNode) {
                        observer.error('node does not exist');
                    }
                    // treeNode[DB_KEY_PATH] = key;
                    observer.next(treeNode);
                    observer.complete();
                },
                (error) => {
                    observer.error(error);
                }
            ); // this.readStoreItem().subscribe(
        });
        return source;
    }

    /**
     * Tries to read a data node and if it doesn't exist, creates it
     * @param {string} name - the name of the node to create
     * @param {number} parentKey - the containing parent's key
     * @param {any} data - if creating a data node, it's data
     * @returns {Observable<Object>} an observable that emits an
     * object whose treeNode property has the node, either read or created,
     * and whose dataNode property has the data node, either read or created.
     */
    public readOrCreateDataNode(
        name: string,
        parentKey: number,
        data: any
    ): Observable<Object> {
        let source: Observable<Object> =
            Observable.create((observer) => {
                this.getNodeByNameInParent(name, parentKey).subscribe(
                    (readTreeNode: TreeNode) => {
                        if (readTreeNode) {
                            console.warn(
                                'got(read) data node by name: ' +
                                readTreeNode.name);
                            // found a node in parent by name 'name'
                            this.readNodeData(readTreeNode).subscribe(
                                (dataNode: DataNode) => {
                                    // assume this always returns non null data
                                    observer.next({
                                        treeNode: readTreeNode,
                                        dataNode: dataNode
                                    });
                                    observer.complete();
                                },
                                (error: any) => {
                                    observer.error(error);
                                } // readNodeData().subscribe(
                            );
                        } // if (node) {
                        else {
                            console.warn(
                                'creating data node by name: ' + name);
                            // no node in parent by name 'name', create it
                            this.createDataNode(
                                name, parentKey, data).subscribe(
                                (parentChild: ParentChild) => {
                                    let dataNode: DataNode =
                                        this.makeDataNode(data);
                                    dataNode[DB_KEY_PATH] =
                                        parentChild.child.dataKey;
                                    observer.next({
                                        treeNode: parentChild.child,
                                        dataNode: dataNode
                                    });
                                    observer.complete();
                                },
                                (error: any) => {
                                    observer.error(error);
                                }
                                ); // .createDataNode().subscribe(
                        } // else {
                    },
                    (error: any) => {
                        observer.error(error);
                    }
                ); // getNodeByNameInParent().subscribe(
            });
        return source;
    }

    /**
     * Tries to read a foldre node and if it doesn't exist, creates it
     * @param {string} name - the name of the node to create
     * @param {number} parentKey - the containing parent's key
     * @returns {Observable<TreeNode>} an observable that emits the requested
     * folder TreeNode, either read or created
     */
    public readOrCreateFolderNode(
        name: string,
        parentKey: number
    ): Observable<TreeNode> {
        let source: Observable<TreeNode> =
            Observable.create((observer) => {
                this.getNodeByNameInParent(name, parentKey).subscribe(
                    (readTreeNode: TreeNode) => {
                        if (readTreeNode) {
                            console.warn(
                                'got(read) folder node by name: ' +
                                readTreeNode.name);
                            observer.next(readTreeNode);
                            observer.complete();
                        }
                        else {
                            console.warn(
                                'creating folder node by name: ' + name);
                            this.createFolderNode(
                                name, parentKey).subscribe(
                                (parentChild: ParentChild) => {
                                    observer.next(parentChild.child);
                                    observer.complete();
                                },
                                (error: any) => {
                                    observer.error(error);
                                }
                                ); // createDataNode().subscribe(
                        } // if (readTreeNode) { .. else {
                    },
                    (error: any) => {
                        observer.error(error);
                    }
                ); // getNodeByNameInParent().subscribe(
            });
        return source;
    }

    /**
     * Updates a node in the TreeNode store
     * @param {TreeNode} treeNode - the new TreeNode object
     * @returns {Observable<void>} observable that emits when the update is
     * complete
     */
    public updateNode(treeNode: TreeNode): Observable<void> {
        return this.updateStoreItem(
            DB_TREE_STORE_NAME,
            treeNode[DB_KEY_PATH], treeNode);
    }

    /**
     * Updates the data part of a data TreeNode
     * @param {TreeNode} treeNode - the data TreeNode whose data we're updating
     * @param {any} newData - the data we're replacing old data with
     * @returns {Observable<void>} observable that emits after update is done
     */
    public updateNodeData(treeNode: TreeNode, newData: any): Observable<void> {
        return this.updateStoreItem(
            DB_DATA_STORE_NAME,
            treeNode.dataKey,
            this.makeDataNode(newData)
        );
    }

    /**
     * Delete a data node with all its data
     * @param {TreeNode} dataNode - the data TreeNode to delete
     * @returns {Observable<void>} observable that emits after deleting
     * is done
     */
    private deleteDataNode(dataNode: TreeNode): Observable<void> {
        let source: Observable<void> = Observable.create((observer) => {
            this.deleteDataStoreItem(dataNode.dataKey)
                .subscribe(
                () => {
                    this.deleteTreeStoreItem(
                        dataNode[DB_KEY_PATH])
                        .subscribe(
                        () => {
                            observer.next();
                            observer.complete();
                        },
                        (error: any) => {
                            observer.error(error);
                        }
                        ); // deleteTreeStoreItem().subscribe(
                },
                (error) => {
                    observer.error(error);
                }
                ); // deleteDataStoreItem().subscribe(
        });
        return source;
    }

    /**
     * Delete a folder node - just the node, not its contents!
     * @param {TreeNode} dataNode - the data TreeNode to delete
     * @returns {Observable<void>} observable that emits after deleting
     * is done
     */
    private deleteFolderNode(folderNode: TreeNode): Observable<void> {
        console.log('deleteFolderNode()');
        let source: Observable<void> = Observable.create((observer) => {
            this.deleteTreeStoreItem(folderNode[DB_KEY_PATH]).subscribe(
                () => {
                    observer.next();
                    observer.complete();
                },
                (error: any) => {
                    observer.error(error);
                }
            );
        });
        return source;
    }

    /**
     * Delete a data or folder TreeNode - if it's a folder node, it deletes
     * just the node; if it's a data node, it deletes the data too.
     * @param {TreeNode} node - the TreeNode to delete
     * @returns {Observable<void>} observable that emits after deleting
     * is done
     */
    public deleteNode(node: TreeNode): Observable<void> {
        if (this.isDataNode(node)) {
            return this.deleteDataNode(node);
        }
        else {
            return this.deleteFolderNode(node);
        }
    }

    /**
     * Given a collection of unique TreeNodes provided as a dictionary,
     * recursively expand the collection to include anything contained by the
     * TreeNode collection
     * @param {[id: string]: TreeNode} keyDict - collection of unique TreeNodes
     * @returns {Observable<{[id: string]: TreeNode}>} - same type as input
     * (keyDict) but expanded with potentially more (contained) nodes
     */
    private expandKeyDict(
        keyDict: { [id: string]: TreeNode; }
    ): Observable<Object> {
        let source: Observable<Object> = Observable.create((observer) => {
            // add nodes supplied argument nodes into the keyDict
            // if a node is a folder node, we get its subtree and
            // add those to the keydict as well, we're done when
            // all folder nodes have been included in keyDict, this
            // means we need two loops - the first one counts how
            // many folders we have, the second one subscribes to
            // the observables with a termination condition based
            // on how many folders have been processed
            let keys: string[] = Object.keys(keyDict),
                nNodes: number = keys.length,
                i: number, j: number,
                nFolders: number = 0,
                nFoldersProcessed: number = 0,
                node: TreeNode;
            // count nFolders
            for (i = 0; i < nNodes; i++) {
                node = keyDict[keys[i]];
                if (this.isFolderNode(node)) {
                    nFolders++;
                }
            }
            // second loop - subscribe and add
            for (i = 0; i < nNodes; i++) {
                node = keyDict[keys[i]];
                if (this.isFolderNode(node)) {
                    // TODO: we can make things slightly more efficient here
                    // by not calling anything if folder is empty
                    this.getSubtreeNodesArray(node).subscribe(
                        (subtreeNodes: TreeNode[]) => {
                            for (j = 0; j < subtreeNodes.length; j++) {
                                node = subtreeNodes[j];
                                keyDict[node[DB_KEY_PATH]] = node;
                            }
                            nFoldersProcessed++;
                            if (nFoldersProcessed === nFolders) {
                                observer.next(keyDict);
                                observer.complete();
                            }
                        },
                        (error: any) => {
                            observer.error(error);
                        }
                    ); // getSubtreeNodesArray(node).subscribe(
                }
                else {
                    // for data nodes we just return keyDict as is
                    // i.e. we do nothing
                    observer.next(keyDict);
                    observer.complete();
                }
            } // if (this.isFolderNode(node)) { .. else { ..
        });
        return source;
    }

    /**
     * Given a collection of unique TreeNodes provided as a dictionary,
     * detach any of those nodes from any parents that aren't already a part
     * of the original collection - detach only from parents outside the
     * collection.
     * @param {[id: string]: TreeNode} keyDict - collection of unique TreeNodes
     * @returns {Observable<{[id: string]: TreeNode}>} - same type as input
     * (keyDict) but expanded with potentially more (contained) nodes
     */
    private detachForDeleteNodes(
        keyDict: { [id: string]: TreeNode; }
    ): Observable<Object> {
        let source: Observable<Object> = Observable.create((observer) => {
            this.expandKeyDict(keyDict).subscribe(
                (expandedKeyDict: Object) => {
                    let i: number,
                        keys: string[] = Object.keys(expandedKeyDict),
                        nNodes: number = keys.length,
                        node: TreeNode,
                        toDetach: TreeNode[] = [];
                    // fill up toDetach and toNotDetach
                    for (i = 0; i < nNodes; i++) {
                        node = expandedKeyDict[keys[i]];
                        // check if any parent of any node in our
                        // delete list is *not* in the list
                        if (!expandedKeyDict[node.parentKey]) {
                            // if a parent is not in the list it
                            // needs to be updated (detached)
                            toDetach.push(node);
                        }
                    }
                    // detach
                    this.detachNodesFromParents(toDetach).subscribe(
                        () => {
                            observer.next(expandedKeyDict);
                            observer.complete();
                        },
                        (error: any) => {
                            observer.error(error);
                        }
                    ); // detachNodesFromParents().subscribe(
                }
            );
        });
        return source;
    }

    /**
     * Returns a stream Observable<TreeNode> that emits a new TreeNode on
     * each request that's got the key of one of the nodeKeys keys
     * @returns {Observable<TreeNode>} observable that emits one at a
     * time one of the nodes with keys in 'nodeKeys'
     */
    private ls(nodeKeys: number[]): Observable<TreeNode> {
        return <Observable<TreeNode>>Observable.from(nodeKeys)
            .flatMap((key: number) => this.readNode(key));
    }

    /**
     * Returns a stream Observable<TreeNode> that emits a new TreeNode
     * that is one of the input's childern (obviously, input must be a
     * folder TreeNode then) - the stream of observables is of children
     * of the given TreeNode.
     * @param {TreeNode} node - the node to list
     * @returns {Observable<TreeNode>} observable that emits one at a
     * time the children of 'node'
     */
    private lsNode(node: TreeNode): Observable<TreeNode> {
        return this.ls(node.childOrder);
    }

    /**
     * Returns whether the input (TreeNode) is a leaf node or not.  A leaf
     * node is one that's either an empty folder or a data node.
     * @param {TreeNode} node - the node to check
     * @returns {boolean} whether the node is a leaf node or not
     */
    private isLeaf(node: TreeNode): boolean {
        // returns true or false depending on if it's a leaf node.
        // a leaf node is either a data node or an empty folder node
        return this.isDataNode(node) || !node.childOrder.length;
    }

    /**
     * Traverses a tree recursively. Based on
     * https://www.reddit.com/r/javascript/comments/3abv2k/ ...
     *      ... /how_can_i_do_a_recursive_readdir_with_rxjs_or_any/
     * @returns Observable<TreeNode> Observable of all subtree nodes of
     * input folder TreeNode
     */
    private getSubtreeNodes(node: TreeNode): Observable<TreeNode> {
        return this.lsNode(node)
            .expand<TreeNode>((childNode: TreeNode) =>
                this.isLeaf(childNode) ?
                    <Observable<TreeNode>>Observable.empty() :
                    this.lsNode(childNode));
    }

    /**
     * Same as getSubtreeNodes(), but instead of returning an observable stream
     * collects the entire list of subtree nodes and returns them in one single
     * array, emitted by an observable when all its elements are available.
     * @param {TreeNode} node - the node whose subtree we're getting
     * @return Observable<TreeNode[]> Observable that emits when the array of
     * all subtree nodes has been traversed in the db.
     */
    public getSubtreeNodesArray(node: TreeNode): Observable<TreeNode[]> {
        let source: Observable<TreeNode[]> = Observable.create((observer) => {
            let nodes: TreeNode[] = [];
            this.getSubtreeNodes(node).subscribe(
                (subtreeNode: TreeNode) => {
                    nodes.push(subtreeNode);
                },
                (error: any) => {
                    observer.error(error);
                },
                () => {
                    observer.next(nodes);
                    observer.complete();
                }
            );
        });
        return source;
    }
}
