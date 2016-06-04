import {ExceptionHandler, provide, ViewChild, Type} from '@angular/core';
import {App, Platform, Nav} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {LoadingPage} from './pages/loading/loading';
import {GettingStartedPage} from './pages/getting-started/getting-started';
import {ListPage} from './pages/list/list';

import {AppState} from './providers/app-state/app-state';
import {IntroPage} from './pages/intro/intro';
import {RecordPage} from './pages/record/record';
import {LibraryPage} from './pages/library/library';
import {SettingsPage} from './pages/settings/settings';
import {AboutPage} from './pages/about/about';

// Global catch-all with this
// AppExceptionHandler class.  NOTE: we use 'extends' instead
// of the more correct 'implements' here in order to avoid
// typescript warnings that did not make sense...
class AppExceptionHandler extends ExceptionHandler {
    call(error, stackTrace = null, reason = null) {
        alert('AppExceptionHandler: ' + error);
    }
}


@App({
    templateUrl: 'build/app.html',
    providers: [provide(ExceptionHandler, { useClass: AppExceptionHandler })],
    config: {} // http://ionicframework.com/docs/v2/api/config/Config/
})
class MyApp {
    @ViewChild(Nav) nav: Nav;

    private rootPage: Type = LoadingPage;
    private pages: Array<{ title: string, component: Type }>

    constructor(private platform: Platform) {
        this.initializeApp();

        // used for an example of ngFor and navigation
        this.pages = [
            { title: 'Record', component: RecordPage },
            { title: 'Library', component: LibraryPage },
            { title: 'Settings', component: SettingsPage },
            { title: 'About', component: AboutPage },
        ];

    }

    initializeApp() {
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            // [ NOTE: cordova must be available for StatusBar ]
            // StatusBar.styleDefault();
            this.nav.setRoot(RecordPage);
        });
    }

    openPage(page) {
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario
        this.nav.setRoot(page.component);
    }
}
