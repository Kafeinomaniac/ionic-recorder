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
    private tab1Root: Type = RecordPage;
    private tab2Root: Type = LibraryPage;
    // making selectedIndex a nonsense index stops the problem of
    // the first tab showing for a split second before the real tab
    // displayed via 'lastSelectedTab'
    private selectedIndex: number = -1;

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
            },
            (error: any) => {
                console.log('getProperty error: ' + error);
            }
        );
    }
}
