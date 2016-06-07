import {Page, NavController} from 'ionic-angular';
import {AppState, LastPageVisited} from '../../providers/app-state/app-state';
import {RecordPage} from '../record/record';
import {LibraryPage} from '../library/library';
import {SettingsPage} from '../settings/settings';
import {AboutPage} from '../about/about';

/**
 * @name LoadingPage
 * @description
 * Page that's displayed while we load things at app's start.
 */
@Page({
    templateUrl: 'build/pages/loading/loading.html'
})
export class LoadingPage {
    private nav: NavController;
    private appState: AppState = AppState.Instance;
    constructor(nav: NavController) {
        console.log('constructor(): LoadingPage');
        this.nav = nav;
        this.appState.getProperty('lastPageVisited').subscribe(
            (lastPageVisited: LastPageVisited) => {
                switch (lastPageVisited) {
                    case LastPageVisited.Record:
                        console.log('lv: record');
                        this.nav.setRoot(RecordPage);
                        break;
                    case LastPageVisited.Library:
                        console.log('lv: library');
                        this.nav.setRoot(LibraryPage);
                        break;
                    case LastPageVisited.Settings:
                        this.nav.setRoot(SettingsPage);
                        break;
                    case LastPageVisited.About:
                        this.nav.setRoot(AboutPage);
                        break;
                }
            }
        );
    }
}
