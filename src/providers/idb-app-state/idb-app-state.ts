// Copyright (c) 2016 Tracktunes Inc

import {
    Observable
} from 'rxjs/Observable';

import {
    Injectable
} from '@angular/core';

import {
    IdbDict
} from '../../models/idb/idb-dict';

import {
    KeyDict
} from '../../models/idb/idb-fs';

export const DB_NAME: string = 'IdbAppState';
const DB_VERSION: number = 1;
const DEFAULT_STATE: State = {
    lastTabIndex: 1,
    lastViewedFolderKey: 2,
    selectedNodes: {},
    gain: { factor: 1.0, maxFactor: 2.0 }
};
const WAIT_MSEC: number = 50;

interface State {
    lastTabIndex: number;
    lastViewedFolderKey: number;
    selectedNodes: KeyDict;
    gain: GainState;
}

export interface GainState {
    factor: number;
    maxFactor: number;
}

/**
 * @name IdbAppState
 * @description
 */
@Injectable()
export class IdbAppState extends IdbDict {
    public isReady: boolean;
    private cachedState: Object = DEFAULT_STATE;

    /**
     * @constructor
     */
    constructor() {
        super(DB_NAME, DB_VERSION);
        console.log('constructor():IdbAppState');
        this.isReady = false;
        this.loadFromDb().subscribe(
            () => {
                this.isReady = true;
            },
            (error) => {
                throw Error('IdbAppState():loadFromDb():' + error);
            },
            () => {
                console.log('IdbAppState() done loading!');
            }
        );
    }

    /**
     * Wait indefinitely until AppState is ready for use
     * @returns {Observable<void>} Observable that emits when AppState
     * is ready for use (has been initialized from db)
     */
    private waitForAppState(): Observable<IDBDatabase> {
        // NOTE:this loop should only repeat a handful of times or so
        let source: Observable<IDBDatabase> = Observable.create((observer) => {
            let repeat: () => void = () => {
                if (this.isReady) {
                    observer.next();
                    observer.complete();
                }
                else {
                    setTimeout(repeat, WAIT_MSEC);
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
    public getProperty(key: string): Observable<any> {
        // return this.cachedState[key];
        // NOTE:this loop should only repeat a handful of times or so
        let source: Observable<any> = Observable.create((observer) => {
            this.waitForAppState().subscribe(
                () => {
                    observer.next(this.cachedState[key]);
                    observer.complete();
                },
                (error) => {
                    observer.error('getProperty(): waitForAppState(): ' +
                        error);
                });
        });
        return source;
    }

    /**
     * Sets a state property (in DB if necessary)
     * @returns {Observable<boolean>} Emits after either we establish that
     * there is no need for an update (emits false in that case) or after we
     * have made the update in the DB (emits true in that case)
     */
    public updateProperty(key: string, value: any): Observable<boolean> {
        let source: Observable<boolean> = Observable.create((observer) => {
            this.waitForAppState().subscribe(
                () => {
                    if (this.cachedState[key] === value) {
                        observer.next(false);
                        observer.complete();
                    }
                    else {
                        this.cachedState[key] = value;
                        this.updateValue(key, value).subscribe(
                            () => {
                                observer.next(true);
                                observer.complete();
                            },
                            (error) => {
                                observer.error('updateProperty():' +
                                    'waitForAppState():updateValue()' + error);
                            });
                    }
                },
                (error) => {
                    observer.error('updateProperty():waitForAppState(): ' +
                        error);
                });
        });
        return source;
    }

    /**
     * load all stat variables from db into memory
     * @returns {Observable<void>} Emits after memory is loaded from db
     */
    private loadFromDb(): Observable<void> {
        let source: Observable<void> = Observable.create((observer) => {
            // using recursive function to chain getOrAddValue()
            // observables in succession (one after the other)
            const getOrAddRecursive: (keys: string[]) => void =
                (keys: string[]) => {
                    if (keys.length === 0) {
                        observer.next();
                        observer.complete();
                    }
                    else {
                        const key: string = keys.pop();
                        this.getOrAddValue(key, DEFAULT_STATE[key]).subscribe(
                            (dbValue: any) => {
                                console.log('getOrAddValue got: ' +
                                    dbValue);
                                this.cachedState[key] = dbValue;
                                getOrAddRecursive(keys);
                            },
                            (error) => {
                                observer.error(
                                    'loadFromDb():getOrAddValue(): ' + error);
                            });
                    }
                };
            this.waitForDB().subscribe(
                () => {
                    getOrAddRecursive(Object.keys(DEFAULT_STATE));
                },
                (error) => {
                    observer.error('loadFromDb():waitForDb(): ' + error);
                });

        });
        return source;
    }
}
