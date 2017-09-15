// Copyright (c) 2017 Tracktunes Inc

import { Component } from '@angular/core';
import { AppFS } from '../../services';

/**
 * @name SelectionPage
 * @description
 * Page of file/folder interface to all recorded files. AddFolderPage
 * music selection.
 */
@Component({
    selector: 'selection-page',
    templateUrl: 'selection-page.html'
})
export class SelectionPage {
    public appFS: AppFS;
    public selectedEntries: Entry[];

    /**
     * @constructor
     * @param {AppState}
     * @param {AppFS}
     */
    constructor(appFS: AppFS) {
        console.log('constructor():SelectionPage');
        this.appFS = appFS;
        this.selectedEntries = [];
        appFS.getSelectedEntries().subscribe(
            (entries: Entry[]) => {
                this.selectedEntries = entries;
            }
        );
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
