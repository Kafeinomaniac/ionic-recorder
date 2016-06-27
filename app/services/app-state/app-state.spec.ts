// // Copyright (c) 2016 Tracktunes Inc

// import {
//     MAX_DB_INIT_TIME,
//     IdbFS
// } from '../local-db/local-db';

// import {
//     AppState
// } from './app-state';

// let idbFS: IdbFS = new IdbFS(),
//     appState: AppState = new AppState(idbFS);

// beforeEach((done: Function) => {
//     idbFS.waitForDB().subscribe(
//         (database: IDBDatabase) => {
//             done();
//         },
//         (error) => {
//             fail(error);
//         });
// });

// jasmine.DEFAULT_TIMEOUT_INTERVAL = MAX_DB_INIT_TIME * 2;

// xdescribe('When appState initialized', () => {
//     it('appState is not falsy', (done) => {
//         setTimeout(
//             () => {
//                 expect(appState).not.toBeFalsy();
//                 done();
//             },
//             MAX_DB_INIT_TIME);
//     });
// });

// xdescribe('When appState initialized again', () => {
//     it('appState is not falsy', (done) => {
//         setTimeout(
//             () => {
//                 expect(appState).not.toBeFalsy();
//                 done();
//             },
//             MAX_DB_INIT_TIME);
//     });

//     // reason we expect lastTabIndex to be 0 is that in
//     // test mode we never select a tab so it remains on 0
//     it('can read lastTabIndex to be 0', (done) => {
//         setTimeout(
//             () => {
//                 appState.getProperty('lastTabIndex').subscribe(
//                     (tabIndex: number) => {
//                         expect(tabIndex).toBe(0);
//                         done();
//                     },
//                     (error: any) => {
//                         fail(error);
//                     }
//                 );
//             },
//             MAX_DB_INIT_TIME);
//     });

//     it('can update lastTabIndex to be 1', (done) => {
//         setTimeout(
//             () => {
//                 appState.updateProperty('lastTabIndex', 1).subscribe(
//                     (updated: boolean) => {
//                         expect(updated).toBe(true);
//                         done();
//                     },
//                     (error) => {
//                         fail(error);
//                     }
//                 );
//             },
//             MAX_DB_INIT_TIME);
//     });

//     it('update again lastTabIndex to be 1 does nothing', (done) => {
//         setTimeout(
//             () => {
//                 appState.updateProperty('lastTabIndex', 1).subscribe(
//                     (updated: boolean) => {
//                         expect(updated).toBe(true);
//                         done();
//                     },
//                     (error) => {
//                         fail(error);
//                     }
//                 );
//             },
//             MAX_DB_INIT_TIME);
//     });

//     it('can read lastTabIndex to be 1', (done) => {
//         setTimeout(
//             () => {
//                 appState.getProperty('lastTabIndex').subscribe(
//                     (tabIndex: number) => {
//                         expect(tabIndex).toBe(1);
//                         done();
//                     },
//                     (error: any) => {
//                         fail(error);
//                     }
//                 );
//             },
//             MAX_DB_INIT_TIME);
//     });

// });
