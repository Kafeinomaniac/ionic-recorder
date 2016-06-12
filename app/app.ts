import {
    Component,
    ExceptionHandler,
    provide,
    ViewChild,
    Type
}                        from '@angular/core';

import {
    ionicBootstrap,
    Platform,
    Nav,
    MenuController
}                        from 'ionic-angular';

// import { StatusBar }     from 'ionic-native';
import { LoadingPage }   from './pages/loading/loading';
import { RecordPage }    from './pages/record/record';
import { LibraryPage }   from './pages/library/library';
import { SettingsPage }  from './pages/settings/settings';
import { AboutPage }     from './pages/about/about';
// Uncomment line below to reset DB (step 1/3)
// import {DB_NAME} from './providers/local-db/local-db';
import { LocalDB }       from './providers/local-db/local-db';
import { AppState }      from './providers/app-state/app-state';

// Catch-all exception handler for this app
class AppExceptionHandler extends ExceptionHandler {
    public call(error: any, stackTrace: any, reason?: any): void {
        alert('AppExceptionHandler: ' + error);
    }
}

@Component({
    templateUrl: 'build/app.html'
})
export class IonicRecorderApp {
    @ViewChild(Nav) private nav: Nav;
    private rootPage: Type;
    private pages: Array<{ title: string, component: Type }>;
    private menu: MenuController;
    private platform: Platform;

    constructor(platform: Platform, menu: MenuController) {
        console.log('constructor(): IonicRecorderApp');
        this.platform = platform;
        this.menu = menu;
        this.rootPage = LoadingPage;
        this.pages = [
            { title: 'Record', component: RecordPage },
            { title: 'Library', component: LibraryPage },
            { title: 'Settings', component: SettingsPage },
            { title: 'About', component: AboutPage }
        ];
        // Uncomment line below to reset DB (step 2/3)
        // this.resetDB();
        this.initializeApp();
    }

    // Uncomment method block below to reset DB (step 3/3)
    // /**
    //  * Completely delete the DB and recreate it from scratch!
    //  * @returns {void}
    //  */
    // private resetDB(): void {
    //     let request: IDBOpenDBRequest = indexedDB.deleteDatabase(DB_NAME);
    //     request.onsuccess = function(): void {
    //         console.log('deleteDatabase: SUCCESS');
    //     };
    //     request.onerror = function(): void {
    //         console.log('deleteDatabase: ERROR');
    //     };
    //     request.onblocked = function(): void {
    //         console.log('deleteDatabase: BLOCKED');
    //     };
    // }

    /**
     * Initialize native stuff once platform is ready
     * @returns {void}
     */
    public initializeApp(): void {
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            // [ NOTE: cordova must be available for StatusBar ]
            // StatusBar.styleDefault();
        });
    }

    /**
     * Go to a page (via menu selection)
     * @returns {void}
     */
    public openPage(page: { title: string, component: Type }): void {
        // close the menu when clicking a link from the menu
        this.menu.close();
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario
        // navigate to the new page if it is not the current page
        this.nav.setRoot(page.component);
    }
}

// Pass the main app component as the first argument
// Pass any providers for your app in the second argument
// Set any config for your app as the third argument:
// http://ionicframework.com/docs/v2/api/config/Config/

ionicBootstrap(
    IonicRecorderApp,
    [
        provide(ExceptionHandler, { useClass: AppExceptionHandler }),
        AppState,
        LocalDB
    ],
    {});
