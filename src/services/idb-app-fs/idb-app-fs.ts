// Copyright (c) 2017 Tracktunes Inc

import { Injectable } from '@angular/core';
import {
    IdbFS,
    TreeNode,
    KeyDict,
    DB_KEY_PATH,
    ROOT_FOLDER_KEY
}
from '../../models/idb/idb-fs';
import {
    DATA_STORE,
    IdbAppData
}
from '../idb-app-data/idb-app-data';
import { Observable } from 'rxjs/Rx';
import { RecordingInfo } from '../web-audio/common';
import { DB_CHUNK_LENGTH } from '../web-audio/record-wav';

const DB_VERSION: number = 1;

export const DB_NAME: string = 'IdbAppFS';
export const UNFILED_FOLDER_NAME: string = 'Unfiled';
export const UNFILED_FOLDER_KEY: number = 2;

@Injectable()
export class IdbAppFS extends IdbFS {
    public unfiledFolderNode: TreeNode;
    private idbAppData: IdbAppData;

    constructor(idbAppData: IdbAppData) {
        console.log('constructor():IdbAppFS');
        super(DB_NAME, DB_VERSION);
        this.idbAppData = idbAppData;
        this.waitForFilesystem().subscribe(
            () => {
                this.readOrCreateNode(
                    UNFILED_FOLDER_KEY,
                    UNFILED_FOLDER_NAME,
                    ROOT_FOLDER_KEY).subscribe(
                    (treeNode: TreeNode) => {
                        if (treeNode[DB_KEY_PATH] !== UNFILED_FOLDER_KEY) {
                            throw Error(UNFILED_FOLDER_NAME +
                                ' key mismatch: ' +
                                UNFILED_FOLDER_KEY +
                                ' vs. ' + treeNode[DB_KEY_PATH]);
                        }
                        this.unfiledFolderNode = treeNode;
                    });
            },
            (error) => {
                throw Error('in IdbAppFS:constructor(): ' + error);
            }
        );
    }

    /**
     * Delete a collection of unique TreeNodes provided as a dictionary
     * @param {KeyDict} keyDict - collection of unique TreeNodes
     * @returns {Observable<void>} - observable that emits after deletion has
     * completed successfully
     */
    public deleteNodes(keyDict: KeyDict): Observable < void > {
        let source: Observable < void > = Observable.create((observer) => {
            super.deleteNodes(keyDict).subscribe(
                () => {
                    for (let key in keyDict) {
                        let node: TreeNode = keyDict[key];
                        if (IdbFS.isFolderNode(node)) {
                            continue;
                        }
                        // node is a data node
                        let nodeData: RecordingInfo = node.data,
                            nSamples: number = nodeData.nSamples,
                            dataStartKey: number = node.data.dbStartKey,
                            dataEndKey: number = dataStartKey +
                            Math.floor(nSamples / DB_CHUNK_LENGTH),
                            dataKey: number = dataStartKey,
                            nDataNodes: number = dataEndKey - dataStartKey + 1,
                            nDeleted: number = 0;
                        for (
                            dataKey = dataStartKey;
                            dataKey <= dataEndKey;
                            dataKey++
                        ) {
                            this.idbAppData.delete(
                                DATA_STORE,
                                dataKey
                            ).subscribe(
                                () => {
                                    nDeleted++;
                                    if (nDeleted === nDataNodes) {
                                        observer.next();
                                        observer.complete();
                                    }
                                },
                                (err1: any) => {
                                    observer.error(err1 ``);
                                }); // delete().subscribe( ...
                        } // for (dataKey ...
                    } // for (let key in keyDict) { ...
                },
                (err2: any) => {
                    observer.error(err2);
                }
            );
        });
        return source;
    }
}
