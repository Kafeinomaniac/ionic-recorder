// Copyright (c) 2016 Tracktunes Inc

import {Page, IonicApp} from 'ionic-angular';
import {Type} from 'angular2/core';
import {RecordPage} from '../record/record';
import {LibraryPage} from '../library/library';
import {AppState} from '../../providers/app-state/app-state';


@Page({
    templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {
    private appState: AppState = AppState.Instance;
    // private tab1Root: Type = RecordPage;
    // private tab2Root: Type = LibraryPage;
    private tab1Root: Type;
    private tab2Root: Type;
    private selectedIndex: number;

    /**
     * @constructor
     * @param {IonicApp} used to get the tabs component
     */
    constructor(private app: IonicApp) {
        console.log('constructor():TabsPage');

        this.appState.getProperty('lastSelectedTab').subscribe(
            (tabIndex: number) => {
                this.app.getComponent('nav-tabs').select(tabIndex);
                this.selectedIndex = tabIndex;
                // we set roots here, when we already know and
                // have set which tab is selected, otherwise the
                // first tab always gets selected by default at 
                // first and in that case it flashes by on the 
                // screen before the real selected tab page appears
                // so to prevent that, we only set roots here
                this.tab1Root = RecordPage;
                this.tab2Root = LibraryPage;
            },
            (getError: any) => {
                console.log('getProperty error: ' + getError);
            }
        ); // getProperty('lastSelectedTab').subscribe(

    }
}
