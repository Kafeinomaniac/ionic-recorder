// Copyright (c) 2016 Tracktunes Inc

import {
    MAX_DB_INIT_TIME,
    LocalDB
}                      from '../local-db/local-db';
import { AppState }    from './app-state';

export function main(): void {
    'use strict';

    let localDB: LocalDB = new LocalDB(),
        appState: AppState = new AppState(localDB);

    beforeEach((done: Function) => {
        localDB.waitForDB().subscribe(
            (database: IDBDatabase) => {
                done();
            },
            (error) => {
                fail(error);
            });
    });

    jasmine.DEFAULT_TIMEOUT_INTERVAL = MAX_DB_INIT_TIME * 2;

    describe('When appState initialized', () => {
        it('appState is not falsy', (done) => {
            setTimeout(
                () => {
                    expect(appState).not.toBeFalsy();
                    done();
                },
                MAX_DB_INIT_TIME);
        });
    });

    describe('When appState initialized again', () => {
        it('appState is not falsy', (done) => {
            setTimeout(
                () => {
                    expect(appState).not.toBeFalsy();
                    done();
                },
                MAX_DB_INIT_TIME);
        });

        // reason we expect lastPageVisited to be 0 is that in
        // test mode we never select a tab so it remains on 0
        it('can read lastPageVisited to be 0', (done) => {
            setTimeout(
                () => {
                    appState.getProperty('lastPageVisited').subscribe(
                        (tabIndex: number) => {
                            expect(tabIndex).toBe(0);
                            done();
                        },
                        (error: any) => {
                            fail(error);
                        }
                    );
                },
                MAX_DB_INIT_TIME);
        });

        it('can update lastPageVisited to be 1', (done) => {
            setTimeout(
                () => {
                    appState.updateProperty('lastPageVisited', 1).subscribe(
                        (updated: boolean) => {
                            expect(updated).toBe(true);
                            done();
                        },
                        (error) => {
                            fail(error);
                        }
                    );
                },
                MAX_DB_INIT_TIME);
        });

        it('update again lastPageVisited to be 1 does nothing', (done) => {
            setTimeout(
                () => {
                    appState.updateProperty('lastPageVisited', 1).subscribe(
                        (updated: boolean) => {
                            expect(updated).toBe(true);
                            done();
                        },
                        (error) => {
                            fail(error);
                        }
                    );
                },
                MAX_DB_INIT_TIME);
        });

        it('can read lastPageVisited to be 1', (done) => {
            setTimeout(
                () => {
                    appState.getProperty('lastPageVisited').subscribe(
                        (tabIndex: number) => {
                            expect(tabIndex).toBe(1);
                            done();
                        },
                        (error: any) => {
                            fail(error);
                        }
                    );
                },
                MAX_DB_INIT_TIME);
        });

    });
}
