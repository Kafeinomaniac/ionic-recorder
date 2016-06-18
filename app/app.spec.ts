// import {
//     ADDITIONAL_TEST_BROWSER_PROVIDERS,
//     TEST_BROWSER_STATIC_PLATFORM_PROVIDERS
// } from '@angular/platform-browser/testing/browser_static';

// import {
//     BROWSER_APP_DYNAMIC_PROVIDERS
// } from '@angular/platform-browser-dynamic';

// import {
//     resetBaseTestProviders,
//     setBaseTestProviders
// } from '@angular/core/testing';

// import {
//     Observable
// } from 'rxjs/Rx';

// import {
//     IonicRecorderApp
// } from './app';

// // import {
// //     LoadingPage
// // } from './pages/loading/loading';

// resetBaseTestProviders();
// setBaseTestProviders(
//     TEST_BROWSER_STATIC_PLATFORM_PROVIDERS,
//     [
//         BROWSER_APP_DYNAMIC_PROVIDERS,
//         ADDITIONAL_TEST_BROWSER_PROVIDERS
//     ]
// );

// class MockClass {
//     public ready(): any {
//         return new Promise((resolve: Function) => {
//             resolve();
//         });
//     }

//     public close(): any {
//         return true;
//     }

//     public setRoot(): any {
//         return true;
//     }
// }

// class MockAppState {
//     public getProperty(propertyName: string): Observable<any> {
//         let source: Observable<any> = Observable.create((observer) => {
//             observer.next(null);
//             observer.complete();
//         });
//         return source;
//     }

//     public updateProperty(
//         propertyName: string,
//         propertyValue: any
//     ): Observable<boolean> {
//         let source: Observable<boolean> = Observable.create((observer) => {
//             observer.next(true);
//             observer.complete();
//         });
//         return source;
//     }
// }

// let app: IonicRecorderApp = null;

// describe('IonicRecorderApp', () => {

//     beforeEach(() => {
//         let mockClass: any = (<any>new MockClass()),
//             mockAppState: any = (<any>new MockAppState());
//         app = new IonicRecorderApp(
//             mockClass,
//             mockClass,
//             mockAppState
//         );
//     });

//     it('initialises with four possible pages', () => {
//         expect(app['pages'].length).toEqual(4);
//     });

//     // it('initialises with loadingPage as root page', () => {
//     //     expect(app['rootPage']).toBeTruthy();
//     //     expect(app['rootPage']).toEqual(LoadingPage);
//     // });

//     // it('goes to a page', () => {
//     //     spyOn(app['menu'], 'close');
//     //     // cant be bothered to set up DOM testing for
//     //     // app.ts to get access to @ViewChild (Nav)
//     //     app['nav'] = (<any>app['menu']);
//     //     app.goToPage(app['pages'][1]);
//     //     expect(app['menu']['close']).toHaveBeenCalled();
//     // });
// });
