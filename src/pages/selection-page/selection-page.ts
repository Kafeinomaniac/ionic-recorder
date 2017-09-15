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
    protected appFS: AppFS;

    /**
     * @constructor
     * @param {AppState}
     * @param {AppFS}
     */
    constructor(
        appFS: AppFS
    ) {
        console.log('constructor():SelectionPage');
        this.appFS = appFS;
    }

    /**
     * UI calls this to determine the icon for an entry.
     * @param {Entry} entry
     */
    public entryIcon(entry: Entry): string {
        return entry.isDirectory ? 'folder' : 'play';
    }

    /**
     * @param {any} indexes
     */
    public reorderEntries(indexes: any): void {
        console.log('reorderEntries(' + indexes + ')');
        console.log(typeof(indexes));
        console.dir(indexes);
        // const entry: Entry = this.selectedEntries[indexes.from];
        // this.selectedEntries.splice(indexes.from, 1);
        // this.selectedEntries.splice(indexes.to, 0, entry);
    }
}
