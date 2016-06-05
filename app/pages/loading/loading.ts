import {Page} from 'ionic-angular';
// import {AppState} from '../../providers/app-state/app-state';

/**
 * @name LoadingPage
 * @description
 * Page that's displayed while we load things at app's start.
 */
@Page({
    templateUrl: 'build/pages/loading/loading.html'
})
export class LoadingPage {
    // private appState: AppState = AppState.Instance;
    constructor() {
        console.log('constructor(): LoadingPage');
    }
}
