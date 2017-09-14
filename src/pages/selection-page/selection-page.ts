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
    public selectedEntries: Entry[];
    public selectedPaths: Set<string>;

    protected appState: AppState;
    protected appFS: AppFS;

    /**
     * @constructor
     * @param {AppState}
     * @param {AppFS}
     */
    constructor(
        appState: AppState,
        appFS: AppFS
    ) {
        console.log('constructor():SelectionPage');
        this.appState = appState;
        this.appFS = appFS;

        this.selectedEntries = [];
        this.selectedPaths = new Set<string>();
    }

    /**
     */
    public getSelectedPathsFromStorage(): void {
        console.log('SelectionPage.updateSelectedPaths()');
        this.appState.get('selectedPaths').then(
            (selectedPaths: Set<string>) => {
                this.selectedPaths = selectedPaths;
                const sortedSelectedPaths: string[] =
                    Array.from(selectedPaths).sort();
                this.appFS.getEntriesFromPaths(sortedSelectedPaths)
                    .subscribe((selectedEntries: Entry[]) => {
                        this.selectedEntries = selectedEntries;
                    });
                }
            ); // this.appState.get('selectedPaths').then(
    }

    /**
     */
    public ionViewWillEnter(): void {
        console.log('SelectionPage.ionViewWillEnter()');
        this.getSelectedPathsFromStorage();
    }

    /**
     * @param {Entry} entry
     */
    public getFullPath(entry: Entry): string {
        const fullPath: string = entry.fullPath;
        return entry.isDirectory && (fullPath.length > 1) ?
            fullPath + '/' : fullPath;
    }

    /**
     * UI calls this to determine the icon for an entry.
     * @param {Entry} entry
     */
    public entryIcon(entry: Entry): string {
        return entry.isDirectory ? 'folder' : 'play';
    }

    /**
     * @param {Entry} entry
     */
    public isSelected(entry: Entry): boolean {
        console.log('isSelected(' + entry.name + '): ' +
            this.selectedPaths.has(this.getFullPath(entry)));
        return this.selectedPaths.has(this.getFullPath(entry));
    }

    /**
     * @param {Entry} entry
     */
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
