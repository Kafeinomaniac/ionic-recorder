// Copyright (c) 2016 Tracktunes Inc

import {Page, IonicApp, NavController, Modal} from 'ionic-angular';
import {AppState} from '../../providers/app-state/app-state';
import {Type} from '@angular/core';
import {IntroPage} from '../intro/intro';
import {RecordPage} from '../record/record';
import {LibraryPage} from '../library/library';
import {SettingsPage} from '../settings/settings';
import {AboutPage} from '../about/about';


/**
 * @name TabsPage
 * @description
 * Tabs page is linked to sidemenu.
 */
@Page({
    templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {
    private appState: AppState = AppState.Instance;
    private tab1Root: Type = RecordPage;
    private tab2Root: Type = LibraryPage;
    private tab3Root: Type = SettingsPage;
    private tab4Root: Type = AboutPage;
    // making selectedIndex a nonsense index stops the problem of
    // the first tab showing for a split second before the real tab
    // displayed via 'lastSelectedTab'
    private selectedIndex: number = -1;

    /**
     * @constructor
     * @param {IonicApp} used to get the tabs component
     */
    constructor(private app: IonicApp, private nav: NavController) {
        console.log('constructor():TabsPage');

        this.appState.getProperty('lastSelectedTab').subscribe(
            (tabIndex: number) => {
                console.log('selecting tab ' + tabIndex);
                this.app.getComponent('nav-tabs').select(tabIndex);
                this.selectedIndex = tabIndex;
            });
        this.appState.getProperty('startWithIntro').subscribe(
            (startWithIntro: boolean) => {
                if (startWithIntro) {
                    let introModal = Modal.create(IntroPage);
                    this.nav.present(introModal);
                }
            });
    }

    onChange() {
        console.log('tabs: onChange: ' + this.selectedIndex);
        console.dir(this);
    }
}
