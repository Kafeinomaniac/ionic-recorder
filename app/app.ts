import {ExceptionHandler, provide, ViewChild, Type} from '@angular/core';
import {App, Platform, Nav} from 'ionic-angular';
// import {StatusBar} from 'ionic-native';
import {LoadingPage} from './pages/loading/loading';
// import {AppState} from './providers/app-state/app-state';
// import {IntroPage} from './pages/intro/intro';
import {RecordPage} from './pages/record/record';
import {LibraryPage} from './pages/library/library';
import {SettingsPage} from './pages/settings/settings';
import {AboutPage} from './pages/about/about';

// Catch-all exception handler for this app
class AppExceptionHandler extends ExceptionHandler {
    public call(error: any, stackTrace: any, reason?: any): void {
        alert('AppExceptionHandler: ' + error);
    }
}

@App({
    templateUrl: 'build/app.html',
    providers: [provide(ExceptionHandler, { useClass: AppExceptionHandler })],
    config: {} // http://ionicframework.com/docs/v2/api/config/Config/
})
export class IonicRecorderApp {
    @ViewChild(Nav) private nav: Nav;
    private rootPage: Type;
    private pages: Array<{ title: string, component: Type }>;

    constructor(private platform: Platform) {
        console.log('constructor(): IonicRecorderApp');
        this.rootPage = LoadingPage;
        this.pages = [
            { title: 'Record', component: RecordPage },
            { title: 'Library', component: LibraryPage },
            { title: 'Settings', component: SettingsPage },
            { title: 'About', component: AboutPage }
        ];
        this.initializeApp();
    }

    public initializeApp(): void {
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            // [ NOTE: cordova must be available for StatusBar ]
            // StatusBar.styleDefault();
            this.nav.setRoot(RecordPage);
        });
    }

    public openPage(page: {title: string, component: Type}): void {
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario
        this.nav.setRoot(page.component);
    }
}
