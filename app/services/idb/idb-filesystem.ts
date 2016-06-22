// Copyright (c) 2016 Tracktunes Inc

import {
    Idb
} from './idb';

import {
    Observable
} from 'rxjs/Rx';

const FILESYSTEM_STORE: string = 'fileSystem';

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

    constructor(dbName: string, dbVersion: number, rootFolderName: string) {
        super({
            name: dbName,
            version: dbVersion,
            storeConfigs: [
                {
                    name: FILESYSTEM_STORE,
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
    }

    public static isDataNode(treeNode: TreeNode): boolean {
        return treeNode['data'];
    }

    public static isFolderNode(treeNode: TreeNode): boolean {
        return !treeNode['data'];
    }

    // if you supply data it's a data node, otherwise it's a folder node
    public static makeTreeNode(
        name: string,
        parentKey: number,
        data?: any
    ): TreeNode {
        let treeNode: TreeNode = {
            name: name,
            parentKey: parentKey,
            timeStamp: Date.now()
        };
        if (this.isFolderNode(treeNode)) {
            treeNode.childOrder = [];
        }
        return treeNode;
    };

    // just check localdb for the api

    // creates either a folder or a data node, depending on data
    // returns Observable<ParentChild>
    public createNode(
        name: string,
        parentKey: number,
        data?: any
    ): Observable<ParentChild> {
        let source: Observable<ParentChild> = Observable.create((observer) => {
            console.log('createNode observable');
        });
        return source;
    }

    // returns Observable<TreeNode>
    public readNode(key: number): Observable<TreeNode> {
        let source: Observable<TreeNode> = Observable.create((observer) => {
            console.log('readNode observable');
        });
        return source;
    }

    // returns Observable<TreeNode[]>
    public readChildNodes(folderNode: TreeNode): Observable<TreeNode[]> {
        let source: Observable<TreeNode[]> = Observable.create((observer) => {
            console.log('readChildNodes observable');
        });
        return source;
    }

    // same as createNode, but it will not create anything nor update anything
    // if the node is already there - in that case it will just return it
    public readOrCreateNode(
        name: string,
        parentKey: number,
        data?: any
    ): Observable<TreeNode> {
        let source: Observable<TreeNode> = Observable.create((observer) => {
            console.log('readOrCreateNode observable');

        });
        return source;
    }

    // returns Observable<void> when done
    public updateNode(key: number, changes: Object): Observable<void> {
        return this.update(FILESYSTEM_STORE, key, changes);
    }

    // returns Observable<void> when done
    public deleteNodes(keyDict: KeyDict): Observable<void> {
        let source: Observable<void> = Observable.create((observer) => {
            console.log('deleteNodes observable');
        });
        return source;
    }
}
