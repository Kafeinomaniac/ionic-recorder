// Copyright (c) 2016 Tracktunes Inc

import {
    Component,
    Type
} from '@angular/core';

import {
    App
} from 'ionic-angular';

import {
    AppState
} from '../../providers/app-state/app-state';

import {
    RecordPage
} from '../record/record';

import {
    LibraryPage
} from '../library/library';

import {
    SettingsPage
} from '../settings/settings';

import {
    AboutPage
} from '../about/about';

// The APP_PAGES array contains all page titles and component types
export const TAB_PAGES: Array<{ title: string, component: Type }> = [
    { title: 'Record', component: RecordPage },
    { title: 'Library', component: LibraryPage },
    { title: 'Settings', component: SettingsPage },
    { title: 'About', component: AboutPage }
];

// function getComponentTabIndex(component: Type): number {
//     'use strict';
//     let i: number,
//         found: number = -1,
//         len: number = TAB_PAGES.length;
//     for (i = 0; i < len; i++) {
//         if (TAB_PAGES[i].component === component) {
//             found = i;
//             break;
//         }
//     }
//     return found;
// }

/**
 * @name TabsPage
 * @description
 * Page that's displayed while we load things at app's start.
 */
@Component({
    templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {
    private app: App;
    private appState: AppState;

    // making selectedIndex a nonsense index stops the problem of
    // the first tab showing for a split second before the real tab
    // displayed via 'lastSelectedTab'
    private mySelectedIndex: number = -1;
    private pages: Array<{ title: string, component: Type }>;

    constructor(app: App, appState: AppState) {
        console.log('constructor():TabsPage');
        this.app = app;
        this.appState = appState;
        this.pages = TAB_PAGES;
        this.appState.getProperty('lastTabIndex').subscribe(
            (tabIndex: number) => {
                // this.selectedIndex = tabIndex;
                this.mySelectedIndex = 1;
                console.log('tab sel: ' + tabIndex);
            }
        );
    }

    // public ionViewDidEnter(): void {
    //     this.appState.getProperty('lastTabIndex').subscribe(
    //         (tabIndex: number) => {
    //             // this.selectedIndex = tabIndex;
    //             this.mySelectedIndex = 1;
    //             console.log('tab sel: ' + tabIndex);
    //         }
    //     );
    // }

    // public select(tabIndex: number): void {
    //     console.log('selected ' + tabIndex);
    // }
}
