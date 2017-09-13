// Copyright (c) 2017 Tracktunes Inc

import {
    Alert,
    AlertController,
    Content,
    ModalController,
    NavController,
    Platform
} from 'ionic-angular';
import {
    Component,
    ViewChild
} from '@angular/core';
import { AppState } from '../../services/app-state/app-state';
import { FS } from '../../models/filesystem/filesystem';

const REQUEST_SIZE: number = 1024 * 1024 * 1024;

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
    @ViewChild(Content) public content: Content;
    // private keyboard: Keyboard;
    private fileSystem: FileSystem;
    public entries: Entry[];
    // UI uses directoryEntry
    public directoryEntry: DirectoryEntry;
    // we remember this just so we can uncheck it when
    // in dialog of delete button
    public unfiledDirectory: DirectoryEntry;
    private navController: NavController;
    // actionSheetController is used by add button
    private alertController: AlertController;
    private modalController: ModalController;
    private appState: AppState;
    // UI uses selectedEntries
    private selectedEntries: Set<string>;

    /**
     * @constructor
     * @param {NavController}
     * @param {AlertController}
     * @param {ModalController}
     * @param {AppState}
     * @param {Platform}
     */
    constructor(
        // keyboard: Keyboard,
        navController: NavController,
        alertController: AlertController,
        modalController: ModalController,
        appState: AppState,
        platform: Platform
    ) {
        console.log('constructor():SelectionPage');
        // this.keyboard = keyboard;
        this.appState = appState;
        this.fileSystem = null;
        this.entries = [];
        this.directoryEntry = null;
        this.unfiledDirectory = null;
        this.selectedEntries = new Set<string>();

        this.navController = navController;
        this.alertController = alertController;
        this.modalController = modalController;
    }

    public ionViewWillEnter(): void {
        console.log('SelectionPage.ionViewWillEnter()');
        // get the filesystem
        FS.getFileSystem(true, REQUEST_SIZE).subscribe(
            (fileSystem: FileSystem) => {
                this.fileSystem = fileSystem;
                this.appState.get('selectedEntries').then(
                    (selectedEntries: Set<string>) => {
                        this.selectedEntries = selectedEntries;
                        selectedEntries.forEach((path: string) => {
                            FS.getPathEntry(fileSystem, path, false).subscribe(
                                (entry: Entry) => {
                                    this.entries.push(entry);
                                },
                                (err: any) => {
                                    alert('Error: SelectionPage constructor!');
                                }
                            );
                        });
                        this.selectedEntries = selectedEntries;
                    }
                );
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
        return this.selectedEntries.has(this.getFullPath(entry));
    }

    public toggleSelect(entry: Entry): void {
        console.log('toggleSelect(' + entry.name + ')');
        const fullPath: string = this.getFullPath(entry);
        if (this.selectedEntries.has(fullPath)) {
            this.selectedEntries.delete(fullPath);
        }
        else {
            this.selectedEntries.add(fullPath);
        }

        this.appState.set('selectedEntries', this.selectedEntries).then();
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
