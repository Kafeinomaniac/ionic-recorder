import {Page, IonicApp} from 'ionic-framework/ionic';
import {RecordPage} from '../record/record';
import {LibraryPage} from '../library/library';
import {Type} from 'angular2/core';

// since the original type definitions file does not have element.style
// we extend it here to avoid Typescript compile errors
interface MyElement extends Element {
    style?: any;
}

@Page({
    templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {
    private tab1Root: Type = RecordPage;
    private tab2Root: Type = LibraryPage;

    constructor(private app: IonicApp) {
        // set the root pages for each tab
        this.tab1Root = RecordPage;
        this.tab2Root = LibraryPage;
    }

    onPageDidEnter() {
        this.app.setTitle('Ionic Record');
        // this is how we hide the tab-bar while using its 
        // caching and state-saving functionality only programmatically
        // https://forum.ionicframework.com/t/ionic2-hide-tabs/37998/4
        (<MyElement>document.querySelector('#tabs ion-tabbar-section')).style.display = 'none';
    }
}
