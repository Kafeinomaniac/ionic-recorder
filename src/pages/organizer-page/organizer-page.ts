// Copyright (c) 2017 Tracktunes Inc

import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import {
    ActionSheet,
    ActionSheetController,
    Alert,
    AlertController,
    Content,
    NavController,
    Platform
} from 'ionic-angular';

import { AppFS } from '../../services';
import { ButtonbarButton } from '../../components/';
import { MoveTo2Page, SelectionPage } from '../../pages';

/**
 * @name OrganizerPage
 * @description
 * Page of file/folder interface to all recorded files. AddFolderPage
 * music organizer.
 */
@Component({
    selector: 'organizer-page',
    templateUrl: 'organizer-page.html'
})
export class OrganizerPage {
    @ViewChild(Content) public content: Content;
    public headerButtons: ButtonbarButton[];
    public footerButtons: ButtonbarButton[];
    protected navController: NavController;
    private actionSheetController: ActionSheetController;
    private alertController: AlertController;
    private changeDetectorRef: ChangeDetectorRef;
    private appFS: AppFS;

    /**
     * @constructor
     * @param {NavController}
     * @param {AlertController}
     * @param {ActionSheetController}
     * @param {ChangeDetectorRef}
     * @param {AppFS}
     * @param {Platform}
     */
    constructor(
        navController: NavController,
        alertController: AlertController,
        actionSheetController: ActionSheetController,
        changeDetectorRef: ChangeDetectorRef,
        appFS: AppFS,
        platform: Platform
    ) {

        console.log('constructor():OrganizerPage');
        this.changeDetectorRef = changeDetectorRef;
        this.actionSheetController = actionSheetController;
        this.navController = navController;
        this.alertController = alertController;
        this.appFS = appFS;
        this.headerButtons = [
            {
                text: 'Select...',
                leftIcon: platform.is('ios') ?
                    'radio-button-off' : 'square-outline',
                rightIcon: 'md-arrow-dropdown',
                clickCB: () => { this.onClickSelectButton() },
                disabledCB: () => { return this.selectButtonDisabled() }
            },
            {
                text: 'Go home',
                leftIcon: 'home',
                clickCB: () => { this.onClickHomeButton() },
                disabledCB: () => { return this.atHome() }
            },
            {
                text: 'Go to parent',
                leftIcon: 'arrow-up',
                rightIcon: 'folder',
                clickCB: () => { this.onClickParentButton() },
                disabledCB: () => { return this.atHome() }
            },
            {
                text: 'Add...',
                leftIcon: 'add',
                clickCB: () => { this.onClickAddButton() }
            }
        ];
        this.footerButtons = [
            {
                text: 'Info',
                leftIcon: 'information-circle',
                clickCB: () => { this.onClickInfoButton() }
            },
            {
                text: 'Move to...',
                leftIcon: 'share-alt',
                rightIcon: 'folder',
                clickCB: () => { this.onClickMoveButton() },
                disabledCB: () => { return this.moveButtonDisabled() }
            },
            {
                text: 'Delete',
                leftIcon: 'trash',
                clickCB: () => { this.onClickDeleteButton() },
                disabledCB: () => { return this.deleteButtonDisabled() }
            },
            {
                text: 'Share',
                leftIcon: 'md-share',
                clickCB: () => { this.onClickShareButton() }
            }
        ];
    }

    public ionViewDidEnter(): void {
        this.appFS.whenReady().subscribe(
            () => {
                this.detectChanges();
            }
        );
    }

    /**
     * UI calls this when the 'Select...' button is clicked.
     * @returns {void}
     */
    public onClickSelectButton(): void {
        console.log('onClickSelectButton()');

        let selectAlert: Alert = this.alertController.create();
        selectAlert.setTitle('Select which, in ' + this.appFS.getPath());
        selectAlert.addButton({
            text: 'All',
            handler: () => {
                this.appFS.selectAllOrNone(true);
            }
        });
        selectAlert.addButton({
            text: 'None',
            handler: () => {
                this.appFS.selectAllOrNone(false);
            }
        });

        selectAlert.addButton('Cancel');
        selectAlert.present();
    }

    public selectButtonDisabled(): boolean {
        console.log('selectButtonDisabled()');
        return this.appFS.nEntries() <= 1;
    }

    /**
     * UI calls this when the 'Go home' button is clicked.
     * @returns {void}
     */
    public onClickHomeButton(): void {
        console.log('onClickHomeButton()');
        this.appFS.switchDirectory('/').subscribe(
            () => {
                this.detectChanges();
            }
        );
    }

    public atHome(): boolean {
        console.log('atHome(): ' + this.appFS.atHome());
        return this.appFS.atHome();
    }

    /**
     * UI calls this when the 'Go to parent' button is clicked.
     * @returns {void}
     */
    public onClickParentButton(): void {
        console.log('onClickParentButton()');
        const path: string = this.appFS.getPath(),
              pathParts: string[] = path.split('/').filter(
                  (str: string) => { return str !== ''; }),
              parentPath: string = '/' +
              pathParts.splice(0, pathParts.length - 1).join('/') + '/';
        this.appFS.switchDirectory(parentPath).subscribe(
            () => {
                this.detectChanges();
            }
        );
    }

    /**
     * UI calls this when the 'Add...' button is clicked.
     * @returns {void}
     */
    public onClickAddButton(): void {
        console.log('onClickAddButton()');
        let actionSheet: ActionSheet = this.actionSheetController.create({
            title: 'Create new ... in ' + this.appFS.getPath(),
            buttons: [
                {
                    text: 'Folder',
                    icon: 'folder',
                    handler: () => {
                        console.log('Add folder clicked.');
                        this.addFolder();
                    }
                },
                {
                    text: 'URL',
                    icon: 'link',
                    handler: () => {
                        console.log('Add URL clicked.');
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    // icon: 'close',
                    handler: () => {
                        console.log('Cancel clicked.');
                    }
                }
            ]
        });
        actionSheet.present();
    }

    /**
     * UI calls this when the info button is clicked.
     * Shows cumulative info on all selected items.
     * @returns {void}
     */
    public onClickInfoButton(): void {
        console.log('onClickInfoButton');
    }

    /**
     * UI calls this when move button is clicked.
     * Moves selected items into a folder.
     * @returns {void}
     */
    public onClickMoveButton(): void {
        console.log('onClickMoveButton');
        this.navController.push(MoveTo2Page);
    }

    /**
     * UI calls this to determine whether to disable move button.
     * @returns {boolean}
     */
    public moveButtonDisabled(): boolean {
        // if the only thing selected is the unfiled folder
        // disable delete and move
        if (this.appFS.nSelected() === 1 &&
            this.appFS.isPathSelected('/Unfiled/')) {
            return true;
        }
        return false;
    }

    /**
     * @returns {void}
     */
    private confirmAndDeleteSelected(): void {
        let nSelected: number = this.appFS.nSelected(),
            itemsStr: string = nSelected.toString() + ' item' +
            ((nSelected > 1) ? 's' : ''),
            entries: string[] = this.appFS.getSelectedPathsArray(),
            deleteAlert: Alert = this.alertController.create();

        entries.sort();

        console.log('<-----------------------> SORTED ENTRIES <------------>');
        console.log(entries);
        console.log('<-----------------------> SORTED ENTRIES <------------>');

        deleteAlert.setTitle('Are you sure you want to delete ' +
                             itemsStr + '?');

        deleteAlert.addButton('Cancel');

        deleteAlert.addButton({
            text: 'Yes',
            handler: () => {
                this.appFS.deleteEntries(entries).subscribe(
                    () => {
                        this.detectChanges();
                    });
            }
        });

        deleteAlert.present();
    }

    /**
     * UI calls this when delete button is clicked.
     * @returns {void}
     */
    public onClickDeleteButton(): void {
        console.log('onClickDeleteButton()');

        if (this.appFS.isPathSelected('/Unfiled/')) {
            const deleteAlert: Alert = this.alertController.create();
            deleteAlert.setTitle('/Unfiled folder cannot be deleted. But it' +
                                 '\'s selected. Automatically unselect it?');
            deleteAlert.addButton('Cancel');
            deleteAlert.addButton({
                text: 'Yes',
                handler: () => {
                    this.appFS.unselectPath('/Unfiled/');
                    this.confirmAndDeleteSelected();
                }
            });
            deleteAlert.present();
        }
        else {
            this.confirmAndDeleteSelected();
        }
    }

    /**
     * UI calls this to determine whether disable the delete button
     * @returns {boolean}
     */
    public deleteButtonDisabled(): boolean {
        // if the only thing selected is the unfiled folder
        // disable delete and move
        if (this.appFS.nSelected() === 1 &&
            this.appFS.isPathSelected('/Unfiled/')) {
            return true;
        }
        return false;
    }

    /**
     * UI calls this when social sharing button is clicked
     * @returns {void}
     */
    public onClickShareButton(): void {
        console.log('onClickShareButton()');
    }

    /**
     * UI calls this when selected badge on top right is clicked
     * @returns {void}
     */
    public onClickSelectedBadge(): void {
        console.log('onClickSelectedBadge()');
        if (this.appFS.nSelected()) {
            // only go to edit selections if at least one is selected
            this.navController.push(SelectionPage);
        }
    }

    /**
     * @returns {void}
     */
    private detectChanges(): void {
        console.log('OrganizerPage.detectChanges()');
        setTimeout(
            () => {
                this.changeDetectorRef.detectChanges();
                this.content.resize();
            },
            0
        );
    }

    /**
     * UI calls this when the new folder button is clicked
     * @returns {void}
     */
    public onClickEntry(entry: Entry): void {
        console.log('onClickEntry()');
        if (entry.isDirectory) {
            this.appFS.switchDirectory(this.appFS.getFullPath(entry))
                .subscribe(
                    () => {
                        this.detectChanges();
                    }
                );
        }
    }

    /**
     * UI calls this when the new folder button is clicked
     * @returns {void}
     */
    public addFolder(): void {
        let parentPath: string = this.appFS.getPath(),
            newFolderAlert: Alert = this.alertController.create({
                title: 'Create a new folder in ' + parentPath,
                inputs: [{
                    name: 'folderName',
                    placeholder: 'Enter folder name...'
                }],
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        handler: () => {
                            console.log('Cancel clicked in new-folder alert');
                        }
                    },
                    {
                        text: 'Done',
                        handler: (data: any) => {
                            let fullPath: string = parentPath + data.folderName;
                            if (!fullPath.length) {
                                // this code should never be reached
                                alert('how did we reach this code?');
                                return;
                            }
                            if (fullPath[fullPath.length - 1] !== '/') {
                                // last char isn't a slash, add a
                                // slash at the end
                                fullPath += '/';
                            }
                            // create the folder via getPathEntry()
                            this.appFS.createDirectory(fullPath).subscribe(
                                (directoryEntry: DirectoryEntry) => {
                                    // re-read parent
                                    // to load in new info
                                    this.appFS.switchDirectory(parentPath)
                                        .subscribe(
                                            () => {
                                                this.detectChanges();
                                            }
                                        );
                                }
                            ); // appFS.getPathEntry(fullPath, true).subscribe(
                        } // handler: (data: any) => {
                    }
                ] // buttons: [
            }); // newFolderAlert: Alert = this.alertController.create({
        newFolderAlert.present();
    }
}
