// Copyright (c) 2017 Tracktunes Inc

import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { AppFilesystem } from '../../services';

/**
 * Page to see or edit all currently selected items.
 * @class SelectionPage
 */
@Component({
    selector: 'selection-page',
    templateUrl: 'selection-page.html'
})
export class SelectionPage {
    public appFilesystem: AppFilesystem;
    public selectedEntries: Entry[];
    private viewController: ViewController;

    /**
     * @constructor
     * @param {AppFilesystem} appFilesystem -
     * @param {ViewController} viewController -
     */
    constructor(appFilesystem: AppFilesystem, viewController: ViewController) {
        console.log('constructor():SelectionPage');
        this.appFilesystem = appFilesystem;
        this.viewController = viewController;
        this.selectedEntries = [];
        appFilesystem.getSelectedEntries().subscribe(
            (entries: Entry[]) => {
                this.selectedEntries = entries;
            }
        );
    }

    public dismiss(data?: any): void {
        // using the injected ViewController this page
        // can "dismiss" itself and pass back data
        this.viewController.dismiss(data);
    }

    /**
     * @param {any} indexes
     */
    public reorderEntries(indexes: any): void {
        console.log('reorderEntries(' + indexes + ')');
        console.log(typeof(indexes));
        console.dir(indexes);
        const entry: Entry = this.selectedEntries[indexes.from];
        this.selectedEntries.splice(indexes.from, 1);
        this.selectedEntries.splice(indexes.to, 0, entry);
    }
}
