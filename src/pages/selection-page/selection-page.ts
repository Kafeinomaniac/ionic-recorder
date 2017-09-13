// Copyright (c) 2017 Tracktunes Inc

import { Component } from '@angular/core';
import { AppState } from '../../services/app-state/app-state';
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
    public entries: Entry[];
    public selectedPaths: Set<string>;

    private appState: AppState;
    private appFS: AppFS;

    /**
     * @constructor
     * @param {AppState}
     */
    constructor(
        appState: AppState,
        appFS: AppFS
    ) {
        console.log('constructor():SelectionPage');
        this.appState = appState;
        this.appFS = appFS;

        this.entries = [];
        this.selectedPaths = new Set<string>();
    }

    public ionViewWillEnter(): void {
        console.log('SelectionPage.ionViewWillEnter()');
        this.appState.get('selectedPaths').then(
            (selectedPaths: Set<string>) => {
                this.selectedPaths = selectedPaths;
                const sortedEntriesPaths: string[] =
                    Array.from(selectedPaths).sort();
                this.appFS.getEntriesFromPaths(sortedEntriesPaths)
                    .subscribe((entries: Entry[]) => {
                        this.entries = entries;
                    });
                }
            );
    }

    public getFullPath(entry: Entry): string {
        const fullPath: string = entry.fullPath,
              len: number = fullPath.length;
        return entry.isDirectory && (len > 1) ?
            entry.fullPath + '/' :
            entry.fullPath;
    }

    /**
     * UI calls this to determine the icon for an entry.
     * @param {Entry} entry
     */
    public entryIcon(entry: Entry): string {
        return entry.isDirectory ? 'folder' : 'play';
    }

    public isSelected(entry: Entry): boolean {
        console.log('isSelected(' + entry.name + ')');
        return this.selectedPaths.has(this.getFullPath(entry));
    }

    public toggleSelect(entry: Entry): void {
        console.log('toggleSelect(' + entry.name + ')');
        const fullPath: string = this.getFullPath(entry);
        if (this.selectedPaths.has(fullPath)) {
            this.selectedPaths.delete(fullPath);
        }
        else {
            this.selectedPaths.add(fullPath);
        }

        this.appState.set('selectedPaths', this.selectedPaths).then();
    }

    public reorderEntries(indexes: any): void {
        console.log('reorderEntries(' + indexes + ')');
        console.log(typeof(indexes));
        console.dir(indexes);
        let entry: Entry = this.entries[indexes.from];
        this.entries.splice(indexes.from, 1);
        this.entries.splice(indexes.to, 0, entry);
    }
}
