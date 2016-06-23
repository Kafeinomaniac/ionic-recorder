// Copyright (c) 2016 Tracktunes Inc

import {
    Idb
} from './idb';

import {
    Observable
} from 'rxjs/Rx';

import {
    positiveWholeNumber
} from '../../services/utils/utils';

const NODE_STORE: string = 'fileSystem';

///////////////////////////////////////////////////////////////////////////////
/// START: Public API
///////////////////////////////////////////////////////////////////////////////

export interface TreeNode {
    name: string;
    parentKey: number;
    timeStamp: number;
    data?: any;
    childOrder?: number[];
    path?: string;
}

export interface ParentChild {
    parent: TreeNode;
    child: TreeNode;
}

export interface KeyDict {
    [id: string]: TreeNode;
}

export class IdbFilesystem extends Idb {
    private rootFolderName: string;
    private rootFolderKey: number;

    constructor(dbName: string, dbVersion: number, rootFolderName: string) {
        super({
            name: dbName,
            version: dbVersion,
            storeConfigs: [
                {
                    name: NODE_STORE,
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
                            name: 'timeStamp',
                            unique: true
                        }
                    ]
                }
            ]
        });

        this.rootFolderName = rootFolderName;
        this.waitForFilesystem().subscribe(
            (rootFolderKey: number) => {
                if (rootFolderKey !== 1) {
                    throw Error('rootFolder key is not 1');
                }
                this.rootFolderKey = rootFolderKey;
            },
            (error) => {
                throw Error('constructor(): ' + error);
            }
        );
    }

    // read or create root folder, returns its key
    public waitForFilesystem(): Observable<number> {
        let source: Observable<number> = Observable.create((observer) => {
            this.waitForDB().subscribe(
                (db: IDBDatabase) => {
                    this.readNode(1).subscribe(
                        (rootNode: TreeNode) => {
                            if (rootNode) {
                                observer.next(1);
                                observer.complete();
                            }
                            else {
                                this.create<TreeNode>(
                                    NODE_STORE,
                                    IdbFilesystem.makeTreeNode(
                                        this.rootFolderName)
                                ).subscribe(
                                    (key: number) => {
                                        observer.next(key);
                                        observer.complete();
                                    },
                                    (error) => {
                                        observer.error('waitForFilesystem():' +
                                            'waitForDB():readNode():' +
                                            'create(): ' + error);
                                    });
                            }
                        },
                        (error) => {
                            observer.error('waitForFilesystem():waitForDB():' +
                                'readNode(): ' + error);
                        });
                },
                (error) => {
                    observer.error('waitForFilesystem():waitForDB() ' + error);
                });
        });
        return source;
    }

    public static isDataNode(treeNode: TreeNode): boolean {
        return treeNode['data'] !== undefined;
    }

    public static isFolderNode(treeNode: TreeNode): boolean {
        return treeNode['data'] === undefined;
    }

    // if you supply data it's a data node, otherwise it's a folder node
    // if you do not supply a parent key it's a root node
    public static makeTreeNode(
        name: string,
        parentKey?: number,
        data?: any
    ): TreeNode {
        let treeNode: TreeNode = {
            name: name,
            parentKey: parentKey,
            timeStamp: Date.now()
        };
        if (parentKey) {
            if (!positiveWholeNumber(parentKey)) {
                throw Error('makeTreeNode(): invalid parentKey');
            }
            treeNode.parentKey = parentKey;
        }
        if (data) {
            // this is a data node
            treeNode.data = data;
        }
        else {
            // this is a tree node
            treeNode.path = '';
            treeNode.childOrder = [];
        }
        return treeNode;
    };

    // just check localdb for the api

    // creates either a folder or a data node, depending on data
    // returns Observable<ParentChild> of both the newly created
    // child TreeNode and the (existing)  parent TreeNode, which has an
    // updated childOrder.
    // Note that we require a parentKey.  Since this db is created with
    // a root (foler) node there is always a parent (key) where you can
    // create a new node.
    public createNode(
        name: string,
        parentKey: number,
        data?: any
    ): Observable<ParentChild> {
        let source: Observable<ParentChild> = Observable.create((observer) => {
            let childNode: TreeNode =
                IdbFilesystem.makeTreeNode(name, parentKey, data);
            this.create<TreeNode>(NODE_STORE, childNode).subscribe(
                (childKey: number) => {
                    this.attachToParent(childKey, childNode).subscribe(
                        (parentNode: TreeNode) => {
                            observer.next({
                                parent: parentNode,
                                child: childNode
                            });
                            observer.complete();
                        },
                        (error) => {
                            observer.error(
                                'createNode():create():attachToParent(): ' +
                                error);
                        }); // attachToParent().subscribe(
                },
                (error) => {
                    observer.error('createNode():create(): ' + error);
                }); // this.create<TreeNode>().subscribe(
        });
        return source;
    }

    // returns Observable<TreeNode>
    public readNode(key: number): Observable<TreeNode> {
        return this.read<TreeNode>(NODE_STORE, key);
    }

    // returns Observable<TreeNode[]>
    public readChildNodes(folderNode: TreeNode): Observable<TreeNode[]> {
        let source: Observable<TreeNode[]> = Observable.create((observer) => {
            console.log('readChildNodes observable');
        });
        return source;
    }

    // returns Observable<void> when done
    public updateNode(key: number, changes: Object): Observable<void> {
        return this.update(NODE_STORE, key, changes);
    }

    // returns Observable<void> when done
    public deleteNodes(keyDict: KeyDict): Observable<void> {
        let source: Observable<void> = Observable.create((observer) => {
            console.log('deleteNodes observable');
        });
        return source;
    }

    // Returns an Observable<TreeNode[]> of all nodes obtained by name
    // regardless of where they are in the tree - this is a way to use
    // the tree as a key/value pair, by the way: just put the key in
    // name and the value goes in the data object of the node.  If nodes
    // by name 'name' exist under any parent, returns an array of them
    // in Observable<Treenode[]>. Note that this should be efficient,
    // because (a) there is an index on 'name' field, (b) most names
    // are unique, because we don't allow two nodes by the
    // same name to be in the same folder so if you have X unique names,
    // there must be at least X folders in the database and the number of
    // folders grows much slower than the number of data nodes, typically.
    public readNodesByName(name: string): Observable<TreeNode[]> {
        let source: Observable<TreeNode[]> = Observable.create((observer) => {
            let nodes: TreeNode[] = [];
            this.getStore(NODE_STORE, 'readonly').subscribe(
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
                        observer.error('readNodesByName(): cursor error');
                    };
                },
                (error) => {
                    observer.error('readNodesByName(): ' + error);
                }
            ); // this.getStore(DB_TREE_STORE_NAME, 'readonly').subscribe(
        });
        return source;
    }

    // Returns an Observable<TreeNode> of node read by name 'name'
    // in parent folder whose key is 'parentKey'.  If such a node does
    // not exist the TreeNode object returned is null.
    public readNodeByNameInParent(
        name: string,
        parentKey: number
    ): Observable<TreeNode> {
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
                        observer.error(
                            'getNodesByNameInParent(): unique name violation'
                        );
                    }
                    else {
                        observer.next(nodeFound);
                        observer.complete();
                    }
                },
                (error) => {
                    observer.error('getNodesByNameInParent(): ' + error);
                }
            ); // readNodesByName().subscribe(
        });
        return source;
    }

    ///////////////////////////////////////////////////////////////////////////
    /// END: Public API
    ///////////////////////////////////////////////////////////////////////////

    // returns observable of parent node (updated with new child order)
    private attachToParent(
        childKey: number,
        childNode: TreeNode
    ): Observable<TreeNode> {
        let source: Observable<TreeNode> = Observable.create((observer) => {
            // you have to read the existing child order first,
            // in order to add to the front of it
            this.readNode(childNode.parentKey).subscribe(
                (parentNode: TreeNode) => {
                    // push newly created nodes to the front of
                    // the parent childOrder list
                    parentNode.childOrder.unshift(childKey);
                    // now you update the node with new childOrder
                    this.update<TreeNode>(
                        NODE_STORE,
                        childNode.parentKey,
                        parentNode).subscribe(
                        () => {
                            // update childNode's path
                            if (IdbFilesystem.isFolderNode(childNode)) {
                                childNode.path = parentNode.path + '/' +
                                    parentNode.name;
                                this.update<TreeNode>(
                                    NODE_STORE,
                                    childKey,
                                    childNode).subscribe(
                                    () => {
                                        observer.next(parentNode);
                                        observer.complete();
                                    },
                                    (error) => {
                                        observer.error('attachToParent():' +
                                            'readNode()update():update(): ' +
                                            error);
                                    }); // updateNode(childNode).subscribe(
                            }
                            else {
                                // non-folder node, not updating path
                                observer.next(parentNode);
                                observer.complete();
                            }
                        },
                        (error) => {
                            observer.error(
                                'attachToParent():readNode():update(): ' +
                                error);
                        }); // updateNode().subscribe(
                },
                (error) => {
                    observer.error('attachToParent():readNode(): ' + error);
                }); // readNode().subscribe(
        });
        return source;
    }
}
