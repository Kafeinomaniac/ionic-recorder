// Copyright (c) 2016 Tracktunes Inc

import {Injectable} from 'angular2/core';
import {Observable} from 'rxjs/Rx';
import {copyFromObject, prependArray} from '../utils/utils';

// TODO:
// 1) replace readChildNodes with childOrder usage instead (faster)
// 2) make sure all ids are strings (do this later)

// non-exported module globals

const DB_VERSION: number = 1;
const DB_TREE_STORE_NAME = 'blobTree';
const DB_DATA_STORE_NAME: string = 'dataTable';
const STORE_EXISTS_ERROR_CODE: number = 0;

// module exports

// use MAX_DB_INIT_TIME in setTimeout() calls after
// initializing DB.  This value is the longest we allow
// the DB to initialize.  If DB does not initialize
// under this time (in msec) then some error will occur
export const MAX_DB_INIT_TIME = 600;
export const DB_NAME: string = 'ionic-recorder-db';
export const DB_NO_KEY: number = 0;
export const DB_KEY_PATH: string = 'id';

// NB: DB_KEY_PATH must be an optional field in both these interfaces

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

@Injectable()
export class LocalDB {
    // 'instance' is used as part of Singleton pattern implementation
    private static instance: LocalDB = null;
    private db: IDBDatabase = null;

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
                // console.log('got DB in constructor');
                this.db = db;
            },
            (error: any) => {
                console.error('in openDB: ' + error);
            }
        );
    }

    // Singleton pattern implementation
    static get Instance() {
        if (!this.instance) {
            this.instance = new LocalDB();
        }
        return this.instance;
    }

    // make sure that this function always return false on
    // DB_NO_KEY.  Returns true if key is a  whole number
    // greater than zero.
    validateKey(key: number): boolean {
        // console.log('validateKey(' + key + ')');
        return (
            key &&
            !isNaN(key) &&
            key > 0 &&
            key === Math.floor(key)
        );
    }

    isDataNode(node: TreeNode) {
        return this.validateKey(node.dataKey);
    }

    isFolderNode(node: TreeNode) {
        return !this.isDataNode(node);
    }

    // always returns an object with a 'data' field (a DataNode)
    makeDataNode(newData: any): DataNode {
        if (typeof newData === 'object' && newData.data) {
            return newData;
        }
        else {
            return {
                data: newData
            };
        }
    }

    // this function is the only way new nodes in the tree are to be created
    makeTreeNode(name: string, parentKey: number, dataKey: number): TreeNode {
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

    makeParentChild(parentNode: TreeNode, childNode: TreeNode,
        dataNode?: DataNode) {
        let pc: ParentChild = {
            parent: parentNode,
            child: childNode
        };
        if (dataNode) {
            pc.data = dataNode;
        }
        return pc;
    }

    waitForDB() {
        // NOTE: MAX_DB_INIT_TIME / 10
        // Check in the console how many times we loop here -
        // it shouldn't be much more than a handful
        let source: Observable<IDBDatabase> = Observable.create((observer) => {
            let repeat = () => {
                if (this.db) {
                    observer.next(this.db);
                    observer.complete();
                }
                else {
                    console.warn('... no DB yet ...');
                    setTimeout(repeat, MAX_DB_INIT_TIME / 10);
                }
            };
            repeat();
        });
        return source;
    }

    // Returns an Observable<IDBDatabase> of the db
    openDB() {
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

    // Returns an Observable<IDBObjectStore> of a store
    getStore(storeName: string, mode: string) {
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

    // Returns an Observable<IDBObjectStore> of the data store
    getDataStore(mode: string) {
        return this.getStore(DB_DATA_STORE_NAME, mode);
    }

    // Returns an Observable<IDBObjectStore> of the tree store
    getTreeStore(mode: string) {
        return this.getStore(DB_TREE_STORE_NAME, mode);
    }
    // Returns an Observable<void> that emits after clearing
    clearStore(storeName: string) {
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

    /*
    * START: generic low-level CRUD methods
    */

    // Returns an Observable<any> of the added item
    createStoreItem(storeName: string, item: any) {
        let source: Observable<any> = Observable.create((observer) => {
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
                            item[DB_KEY_PATH] = addRequest.result;
                            observer.next(item);
                            observer.complete();
                        };
                        addRequest.onerror = (event: IDBEvent) => {
                            observer.error('in addRequest.onerror');
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

    // Returns an Observable<any> of data item
    readStoreItem(storeName: string, key: number) {
        let source: Observable<any> = Observable.create((observer) => {
            if (!this.validateKey(key)) {
                observer.error('invalid key');
            }
            else {
                this.getStore(storeName, 'readonly').subscribe(
                    (store: IDBObjectStore) => {
                        let getRequest: IDBRequest = store.get(key);

                        getRequest.onsuccess = (event: IDBEvent) => {
                            console.log('-> *** <- readStoreItem(' +
                                key + '): SUCCESS!');
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

    // Returns an Observable<void> that emits after updating item
    updateStoreItem(storeName: string, key: number, newItem: any) {
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
                                    (event: IDBErrorEvent) => {
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
                                    (event: IDBErrorEvent) => {
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

    // Returns an Observable<void> that emits upon success in
    // deleting item, or upon an error.
    deleteStoreItem(storeName: string, key: number) {
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

    /*
     * END: generic low-level CRUD methods
     */

    /*
     * START: TreeStore- / DataStore- specific methods
     */

    // Returns observable<DataNode> of data store item created, it has key
    // set on it to the new key assigned to it by the databse
    createDataStoreItem(data: any) {
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

    // Returns observable<TreeNode> of tree node created, it has key
    // set on it to the new key assigned to it by the databse
    createTreeStoreItem(name: string, parentKey: number, dataKey: number) {
        let source: Observable<TreeNode> = Observable.create((observer) => {
            this.createStoreItem(DB_TREE_STORE_NAME,
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
    deleteDataStoreItem(key: number) {
        return this.deleteStoreItem(DB_DATA_STORE_NAME, key);
    }

    // Returns an Observable<void> of success in deleting item
    deleteTreeStoreItem(key: number) {
        return this.deleteStoreItem(DB_TREE_STORE_NAME, key);
    }

    /*
     * END: TreeStore- / DataStore- specific methods
     */

    // Returns an Observable<ParentChild> of new child node created and
    // its associated parent node, whose child order has been updated
    // verifies name is unique among siblings in parent
    createNode(name: string, parentKey: number, data?: any) {
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
    readNodesByName(name: string) {
        let source: Observable<TreeNode[]> = Observable.create((observer) => {
            let nodes: TreeNode[] = [];
            this.getTreeStore('readonly').subscribe(
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
            ); // getTreeStore().subscribe(
        });
        return source;
    }

    // Returns an Observable<TreeNode> of node read by name 'name'
    // in parent folder whose key is 'parentKey'.  If such a node does
    // not exist the TreeNode object returned is null.
    getNodeByNameInParent(name: string, parentKey: number) {
        let source: Observable<TreeNode> = Observable.create((observer) => {
            this.readNodesByName(name).subscribe((nodes: TreeNode[]) => {
                let nodeFound: TreeNode = null,
                    nFound: number = 0;
                for (let i in nodes) {
                    if (nodes[i].parentKey === parentKey) {
                        nodeFound = nodes[i];
                        nFound++;
                        if (nFound > 1) {
                            break;
                        }
                    }
                }
                if (nFound > 1) {
                    observer.error('unique name violation 1');
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
    readNodeData(treeNode: TreeNode) {
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
     *
     */
    readNodesById(nodeKeys: number[]) {
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

    readChildNodes(parentNode: TreeNode) {
        return this.readNodesById(parentNode.childOrder);
    }

    // returns observable of parent node (updated with new child order)
    attachToParent(childNode: TreeNode) {
        console.log('ATTACH TO PARENT: ' + childNode.name);
        let source: Observable<TreeNode> = Observable.create((observer) => {
            if (this.validateKey(childNode.parentKey)) {
                // you have to read the existing child order first,
                // in order to add to the front of it
                this.readNode(childNode.parentKey).subscribe(
                    (parentNode: TreeNode) => {
                        console.log('READNODE GOT ::: ' + parentNode);
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
                                            console.log('SET CHILDNODE PATH' +
                                                'OF ' + childNode.name +
                                                ' TO: ' + parentNode.path +
                                                '/' + parentNode.name);
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
                            console.log('SET CHILDNODE PATH TO EMPTY STRING');
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

    detachNodesFromParent(childNodes: TreeNode[]) {
        console.log('detachNodesFromParent(' +
            childNodes.map(x => x.name).join(', ') + ')');
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

    detachNodesFromParents(nodes: TreeNode[]) {
        console.log('detachNodesFromParents(' +
            nodes.map(x => x.name).join(', ') + ')');
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
    // HIGH LEVEL API - these are the only functions you should be using
    //     TreeNode functions
    // We only have nodes, you can think of them as art of a tree (if you
    // pay attention to the parentKey field) or a flat data table that is
    // kept lightweight by not storing data in it, instead storing pointers
    // to the hefty data that resides in a separate table.  If you want to
    // use this as a flat structure, use parentKey of DB_NO_KEY. Names of all
    // items in this flat structure must be unique.  If you want to use this
    // as a tree, use parentKey to designate parent node, names must be
    // unique only among siblings of the same parent.
    //
    // Here are the public high level API functions obtained via the
    // following command:
    // (1392) ~/workspace/tracktunes/git/ionic-recorder/app
    // >  grep localDB\. `findword 'localDB.' | grep -v local-db` | \
    //    sed 's/.*ocalDB\.//' | sed 's/(.*//'|sort -u|grep -v Instance|nl
    //   1	createDataNode
    //   2	createFolderNode
    //   4	isFolderNode
    //   5	readChildNodes
    //   6	readNode
    //   7	readOrCreateDataNode
    //   8	readOrCreateFolderNode
    //   9	updateNode
    //   10	updateNodeData
    // NOTE: Public API functions are already wrapped with waitForDB()
    // because getStore() is!
    ///////////////////////////////////////////////////////////////////////////

    // Returns an Observable<ParentChild> of new child node created and
    // its associated parent node, whose child order has been updated
    // verifies name is unique among siblings in parent
    createDataNode(name: string, parentKey: number, data: any) {
        let source: Observable<ParentChild> = Observable.create((observer) => {
            // non falsy data supplied, store it in the data table first
            this.getNodeByNameInParent(name, parentKey)
                .subscribe((nodeInParent: TreeNode) => {
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

    // Returns an Observable<ParentChild> of new child node created and
    // its associated parent node, whose child order has been updated
    // verifies name is unique among siblings in parent
    createFolderNode(name: string, parentKey: number) {
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

    // Returns an Observable<TreeNode> of the read tree node, no data
    // returned If a node with key 'key' is not in the tree, null
    // TreeNode object is returned
    readNode(key: number) {
        console.log('READNODE ' + key);
        let source: Observable<TreeNode> = Observable.create((observer) => {
            this.readStoreItem(DB_TREE_STORE_NAME, key).subscribe(
                (treeNode: TreeNode) => {
                    if (!treeNode) {
                        observer.error('node does not exist');
                    }
                    treeNode[DB_KEY_PATH] = key;
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

    // Returns an Observable<Object> of new child node created and
    // its associated parent node, whose child order has been updated
    readOrCreateDataNode(
        name: string, parentKey: number, data: any) {
        let source: Observable<Object> =
            Observable.create((observer) => {
                this.getNodeByNameInParent(name, parentKey).subscribe(
                    (readTreeNode: TreeNode) => {
                        if (readTreeNode) {
                            console.log('data node in DB, returning it ...');
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
                            console.log('data node not in DB, creating it ...');
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

    // observable of a TreeNode
    readOrCreateFolderNode(name: string, parentKey: number) {
        let source: Observable<TreeNode> =
            Observable.create((observer) => {
                this.getNodeByNameInParent(name, parentKey).subscribe(
                    (readTreeNode: TreeNode) => {
                        if (readTreeNode) {
                            console.log(
                                'folder node in DB, returning it ...');
                            observer.next(readTreeNode);
                            observer.complete();
                        }
                        else {
                            console.log(
                                'folder node not in DB, creating it ...');
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

    // Returns an Observable<void> that emits after updating tree store item
    // Input is a tree node that has been updated already with new
    // field values, it must have the key property set to the right
    // key of the node in the tree store to update
    updateNode(treeNode: TreeNode) {
        return this.updateStoreItem(DB_TREE_STORE_NAME,
            treeNode[DB_KEY_PATH], treeNode);
    }

    // Returns an Observable<void> that emits after updating data store item
    // only updates the data that treeNode points to, not the
    // treeNode itself
    updateNodeData(treeNode: TreeNode, newData: any) {
        return this.updateStoreItem(
            DB_DATA_STORE_NAME,
            treeNode.dataKey,
            this.makeDataNode(newData)
        );
    }

    // Returns an Observable<void> that emits after deleting items
    // in both tree store and data store associated with data node
    // TODO(?): convert this to key input
    deleteDataNode(dataNode: TreeNode) {
        console.log('====> deleteDataNode(' + dataNode.name + ')');
        let source: Observable<void> = Observable.create((observer) => {
            this.deleteDataStoreItem(dataNode.dataKey)
                .subscribe(() => {
                    this.deleteTreeStoreItem(dataNode[DB_KEY_PATH])
                        .subscribe(() => {
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

    deleteFolderNode(folderNode: TreeNode) {
        console.log('====> deleteFolderNode(' + folderNode.name + ')');
        let source: Observable<void> = Observable.create((observer) => {
            this.deleteTreeStoreItem(folderNode[DB_KEY_PATH])
                .subscribe(() => {
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

    // low level deletes a single node non-recursively
    deleteNode(node: TreeNode) {
        if (this.isDataNode(node)) {
            return this.deleteDataNode(node);
        }
        else {
            return this.deleteFolderNode(node);
        }
    }

    // Returns an Observable that emits upon deletion. if it's a folder
    // node we're deleting it will delete all its content recursively.
    // it will detach appropriately too.

    // deleteNodes
    // 1) counts how many need detachment
    // 2) subscribes, with counts as termination conditions - one
    // count is for deletion of the nodes themselves (length of
    // supplied argument keys list) another count is the detachments
    // that we need to perform - once all counts have been completed,
    // and this is something you check in the inner function of every
    // subscription, you're done.

    // expandForDeleteNodes
    expandKeyDict(keyDict: { [id: string]: TreeNode; }) {
        console.log('=> expand(' + Object.keys(keyDict).join(', ') + ')');
        let source: Observable<Object> = Observable.create((observer) => {
            // add nodes supplied argument nodes into the keyDict
            // if a node is a folder node, we get its subtree and
            // add those to the keydict as well, we're done when
            // all folder nodes have been included in keyDict, this
            // means we need two loops - the first one counts how
            // many folders we have, the second one subscribes to
            // the observables with a termination condition based
            // on how many folders have been processed
            let keys = Object.keys(keyDict),
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
                                console.log('=> expand result:' +
                                    Object.keys(keyDict).join(', '));
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

    detachForDeleteNodes(keyDict: { [id: string]: TreeNode; }) {
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

    deleteNodes(keyDict: { [id: string]: TreeNode; }) {
        let source: Observable<void> = Observable.create((observer) => {
            this.detachForDeleteNodes(keyDict).subscribe(
                (keyDict: Object) => {
                    let i: number,
                        keys: string[] = Object.keys(keyDict),
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

    // returns a stream Observable<TreeNode> that emits a new
    // TreeNode that's got
    // the key of one of the nodeKeys keys
    ls(nodeKeys: number[]): Observable<TreeNode> {
        console.log('LS: ' + nodeKeys);
        return <Observable<TreeNode>>Observable.fromArray(nodeKeys)
            .flatMap((key: number) => this.readNode(key));
    }

    // returns a stream Observable<TreeNode> that emits a new
    // TreeNode that's got
    // the key of one of the nodeKeys keys
    lsNode(node: TreeNode): Observable<TreeNode> {
        console.log('LS NODE: ' + node.childOrder);
        return this.ls(node.childOrder);
    }

    // returns boolean
    isLeaf(node: TreeNode) {
        console.log('isLeaf(' + node.name + '): ' +
            (this.isDataNode(node) || !node.childOrder.length));
        // returns true or false depending on if it's a leaf node.
        // a leaf node is either a data node or an empty folder node
        return this.isDataNode(node) || !node.childOrder.length;
    }

    // traverses a tree recursively, based on
    // https://www.reddit.com/r/javascript/comments/3abv2k/ ...
    //      ... /how_can_i_do_a_recursive_readdir_with_rxjs_or_any/
    getSubtreeNodes(node: TreeNode): Observable<TreeNode> {
        return this.lsNode(node)
            .expand<TreeNode>((childNode: TreeNode) =>
                this.isLeaf(childNode) ?
                    <Observable<TreeNode>>Observable.empty() :
                    this.lsNode(childNode));
    }

    // enumerates the entire getSubtreeNodes() sequence, returns an
    // array of treenodes
    getSubtreeNodesArray(node: TreeNode): Observable<TreeNode[]> {
        console.log('getSubtreeNodesArray: ' + node.name);
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
                    console.log('-----> GOT NODES: ' +
                        nodes.map(x => x.name).join(', '));
                    observer.next(nodes);
                    observer.complete();
                }
            );
        });
        return source;
    }
}