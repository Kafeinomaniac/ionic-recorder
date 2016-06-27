// Copyright (c) 2016 Tracktunes Inc

import {
    Injectable
} from '@angular/core';

import {
    Observable
} from 'rxjs/Rx';

import {
    IdbFS,
    TreeNode,
    DB_KEY_PATH,
} from '../idb/idb-fs';

export interface GainState {
    factor: number;
    maxFactor: number;
}

export const STATE_NODE_NAME: string = 'app-state';
export const ROOT_FOLDER_NAME: string = 'root';
export const UNFILED_FOLDER_NAME: string = 'Unfiled';

interface State {
    lastTabIndex: number;
    lastViewedFolderKey: number;
    rootFolderKey: number;
    unfiledFolderKey: number;
    selectedNodes: { [id: string]: boolean };
    gain: GainState;
}

const DEFAULT_STATE: State = {
    lastTabIndex: 1,
    lastViewedFolderKey: 0,
    rootFolderKey: 0,
    unfiledFolderKey: 0,
    selectedNodes: {},
    gain: { factor: 1.0, maxFactor: 2.0 }
};

/**
 * @name AppState
 * @description
 * Track the state of the app using IndexedDB so that we can start where
 * we left off the last time we used this app.
 */
@Injectable()
export class AppState {
    private idbFS: IdbFS;
    private treeNode: TreeNode;
    private dataNode: DataNode;

    /**
     * @constructor
     */
    constructor(idbFS: IdbFS) {
        console.log('constructor():AppState');
        this.idbFS = idbFS;
        // Create root folder
        this.idbFS.readOrCreateFolderNode(ROOT_FOLDER_NAME, DB_NO_KEY)
            .subscribe(
            (rootFolderNode: TreeNode) => {
                let rootNodeKey: number = rootFolderNode[DB_KEY_PATH];
                DEFAULT_STATE['rootFolderKey'] = rootNodeKey;
                // Create Unfiled folder as child of root using root's key
                this.idbFS.readOrCreateFolderNode(
                    UNFILED_FOLDER_NAME, rootNodeKey)
                    .subscribe(
                    (unfiledFolderNode: TreeNode) => {
                        DEFAULT_STATE['unfiledFolderKey'] =
                            unfiledFolderNode[DB_KEY_PATH];
                        // create default state data node after it's
                        // been updated with the correct keys for
                        // both root and unfiled folders
                        this.idbFS.readOrCreateDataNode(
                            STATE_NODE_NAME, DB_NO_KEY, DEFAULT_STATE)
                            .subscribe(
                            (result: any) => {
                                this.treeNode = result.treeNode;
                                this.dataNode = result.dataNode;
                            },
                            (error: any) => {
                                throw new Error(error);
                            }
                            ); // readOrCreateDataNode().subscribe(
                    },
                    (error: any) => {
                        throw new Error(error);
                    }
                    ); // readOrCreateFolderNode().subscribe(
            },
            (error: any) => {
                throw new Error(error);
            }
            ); // readOrCreateFolderNode().subscribe(
    }

    /**
     * Get the key of the last viewed folder from the local DB
     * @returns {Observable<number>} Observable of last viewed folder's key
     */
    public getLastViewedFolderKey(): Observable<number> {
        let source: Observable<number> = Observable.create((observer) => {
            this.getProperty('lastViewedFolderKey').subscribe(
                (lastViewedFolderKey: number) => {
                    if (lastViewedFolderKey === DB_NO_KEY) {
                        // we have not yet set the lastViewedFolderKey
                        // here we set it to the default, which is root folder
                        this.getProperty('rootFolderKey').subscribe(
                            (rootFolderKey: number) => {
                                // set the lastViewedFolder to be root folder
                                this.updateProperty(
                                    'lastViewedFolder',
                                    rootFolderKey)
                                    .subscribe(
                                    () => {
                                        observer.next(rootFolderKey);
                                        observer.complete();
                                    },
                                    (error: any) => {
                                        observer.error(error);
                                    }
                                    ); // updateProperty.subscribe(
                            },
                            (error: any) => {
                                observer.error(error);
                            }
                        ); // getProperty().subscribe(
                    }
                    else {
                        observer.next(lastViewedFolderKey);
                        observer.complete();
                    }
                },
                (error: any) => {
                    observer.error(error);
                }
            ); // getProperty().subscribe(
        });
        return source;
    }

    // Creates the following folders in a newly initialized app:
    //   1) root folder '/'
    //   2) unfiled folder 'Unfiled', under root
    //   3) favorites folder 'Favorites', under root
    //   4) recent folder 'Recent',under root
    // private createInitialFolderStructure() {
    // }

    /**
     * Returns an observable that emits when this class is ready for use
     * @returns {Observable<void>} Observable, emits after this class is ready
     */
    public waitForAppState(): Observable<void> {
        let source: Observable<void> = Observable.create((observer) => {
            let repeat: () => void = () => {
                if (this.treeNode && this.dataNode) {
                    observer.next();
                    observer.complete();
                }
                else {
                    // console.warn('... no STATE yet ...');
                    setTimeout(repeat, MAX_DB_INIT_TIME / 10);
                }
            };
            repeat();
        });
        return source;
    }

    /**
     * Gets a state property (from DB if necessary)
     * @returns {Observable<any>} Observable of value of property obtained
     */
    public getProperty(propertyName: string): Observable<any> {
        let source: Observable<any> = Observable.create((observer) => {
            this.waitForAppState().subscribe(
                () => {
                    if (!this.dataNode || !this.dataNode.data) {
                        observer.error('app state not properly read');
                    }
                    if (!this.dataNode.data.hasOwnProperty(propertyName)) {
                        observer.error("no property by name '" +
                            propertyName + "' in dataNode");
                    }
                    observer.next(this.dataNode.data[propertyName]);
                    observer.complete();
                },
                (error: any) => {
                    observer.error(error);
                }
            ); // waitAppState().subscribe(
        });
        return source;
    }

    /**
     * Sets a state property (in DB if necessary)
     * @returns {Observable<boolean>} Emits after either we establish that
     * there is no need for an update (emits false in that case) or after we
     * have made the update in the DB (emits true in that case)
     */
    public updateProperty(
        propertyName: string,
        propertyValue: any
    ): Observable<boolean> {
        let source: Observable<boolean> = Observable.create((observer) => {
            this.waitForAppState().subscribe(
                () => {
                    if (!this.dataNode) {
                        // we expected to have read the state at least once
                        // before calling update, which sets this.dataNode
                        observer.error('state has no data node in update');
                    }
                    else if (!this.dataNode[DB_KEY_PATH]) {
                        // we expected to have read the state at least once
                        // before calling update, which tags on the property
                        // DB_KEY_PATH onto the this.state's State object
                        observer.error('state has no key path in update');
                    }
                    else if (!this.treeNode) {
                        // we expected to have read the state at least once
                        // before calling update, which sets this.treeNode
                        observer.error('state has no tree node in update');
                    }
                    else if (
                        this.getProperty(propertyName) !== propertyValue) {
                        // only update if propertyValue is different
                        // update in memory:
                        this.dataNode.data[propertyName] = propertyValue;
                        // update in DB:
                        this.idbFS.updateNodeData(
                            this.treeNode, this.dataNode.data).subscribe(
                            () => {
                                observer.next(true);
                                observer.complete();
                            },
                            (error: any) => {
                                observer.error(error);
                            }
                            ); // updateNodeData().subscribe(
                    }
                    else {
                        observer.next(false);
                        observer.complete();
                    }
                },
                (error) => {
                    alert('error waiting for app state: ' + error);
                }
            ); // waitForAppState().subscribe(
        });
        return source;
    }
}
