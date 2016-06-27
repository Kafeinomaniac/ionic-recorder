// Copyright (c) 2016 Tracktunes Inc

import {
    Injectable
} from '@angular/core';

import {
    Observable
} from 'rxjs/Rx';

import {
    IdbDict
} from '../idb/idb-dict';

export interface GainState {
    factor: number;
    maxFactor: number;
}

// AppState - should it have the unfiled folder name?
// it is supposed to save state to db
// unfiled folder name: is that "state"?  we could 
// easily have record.ts hold the constant of that folder
// name and then have library get the constant from record.ts.
//
// app state keeps track of:
// last open app tab (record / library / about / settings)
// last viewed folder (for library tab/page)
// selected nodes
// gain
// any other settings from the settings page
//
// the cool thing about app-state is that it opens its own 
// database and connection, so that any changes to it do not
// affect the other db read/writes.
// 
// we don't need any fancy data structures, just a set 
// that contains the keys we're going to use - even that's 
// hardly needed.
//
// when app state is initialized, it loads the saved app
// state from the db. so yes, it needs to know what to load, so
// it needs at least the keys. and for the memory retrieval part, 
// it needs the values.  so it might as well have a data structures
// for the key-value pairs in memory.
//
// if an update is called and nothing has changed, then appState
// does nothing, just returns the thing from memory
// it needs to be able to save any value, so it may use JSON.
// stringify() for the value() part.

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
    private idbDict: IdbDict;

    /**
     * @constructor
     */
    constructor(idbDict: IdbDict) {
        console.log('constructor():AppState');
        this.idbDict = idbDict;
    }

    /**
     * Gets a state property (from DB if necessary)
     * @returns {Observable<any>} Observable of value of property obtained
     */
    public getProperty(propertyName: string): Observable<any> {
        let source: Observable<any> = Observable.create((observer) => {
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
        });
        return source;
    }
}
