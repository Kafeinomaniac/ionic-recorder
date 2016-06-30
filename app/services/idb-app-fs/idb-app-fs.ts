// Copyright (c) 2016 Tracktunes Inc

import {
    Injectable
} from '@angular/core';

import {
    IdbFS,
    TreeNode,
    DB_KEY_PATH
} from '../idb/idb-fs';

const DB_NAME: string = 'IdbAppFS';
const DB_VERSION: number = 1;

export const UNFILED_FOLDER_NAME: string = 'Unfiled';
export const UNFILED_FOLDER_KEY: number = 2;

@Injectable()
export class IdbAppFS extends IdbFS {
    constructor() {
        super(DB_NAME, DB_VERSION);
        console.log('constructor():IdbAppFS');
        this.waitForFilesystem().subscribe(
            () => {
                this.readOrCreateNode(
                    UNFILED_FOLDER_KEY,
                    UNFILED_FOLDER_NAME,
                    1).subscribe(
                    (treeNode: TreeNode) => {
                        if (treeNode[DB_KEY_PATH] !== UNFILED_FOLDER_KEY) {
                            throw Error(UNFILED_FOLDER_NAME +
                                ' key mismatch: ' + UNFILED_FOLDER_KEY +
                                ' vs. ' + treeNode[DB_KEY_PATH]);
                        }
                    });
            },
            (error) => {
                throw Error('in IdbAppFS:constructor(): ' + error);
            }
        );
        // this.createNode(UNFILED_FOLDER_NAME, 1).subscribe(
        //     (parentChild: ParentChild) => {
        //         if (parentChild.child[DB_KEY_PATH] !==
        //             UNFILED_FOLDER_KEY) {
        //             throw Error(UNFILED_FOLDER_NAME +
        //                 ' key mismatch: ' + UNFILED_FOLDER_KEY +
        //                 ' vs. ' + parentChild.child[DB_KEY_PATH]);
        //         }
        //     });
    }
}
