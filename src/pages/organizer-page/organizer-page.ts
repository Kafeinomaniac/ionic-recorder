// Copyright (c) 2017 Tracktunes Inc

import {
    Alert,
    AlertController,
    ActionSheet,
    ActionSheetController,
    Content,
    ItemSliding,
    ModalController,
    NavController,
    Platform
} from 'ionic-angular';
import {
    ChangeDetectorRef,
    Component,
    ViewChild
} from '@angular/core';
import { alertAndDo } from '../../models/utils/alerts';
import { AppState } from '../../services/app-state/app-state';
import { ButtonbarButton } from '../../components/button-bar/button-bar';
import {
    DB_KEY_PATH,
    KeyDict,
    ParentChild,
    ROOT_FOLDER_KEY,
    TreeNode
} from '../../models/idb/idb-fs';
import { EditSelectionPage } from '../edit-selection-page/edit-selection-page';
import { FS } from '../../models/filesystem/filesystem';
import {
    IdbAppFS,
    UNFILED_FOLDER_KEY
} from '../../services/idb-app-fs/idb-app-fs';
import { isPositiveWholeNumber, isUndefined } from '../../models/utils/utils';
import { MoveToPage, TrackPage } from '../';

const CHECKED_KEY: string = 'isChecked';

const REQUEST_SIZE: number = 1024 * 1024 * 1024;

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
    private fileSystem: FileSystem;
    public entries: Entry[];
    public directoryEntry: DirectoryEntry;
    public nChecked: number;
    public headerButtons: ButtonbarButton[];
    public footerButtons: ButtonbarButton[];
    private navController: NavController;
    private actionSheetController: ActionSheetController;
    private alertController: AlertController;
    private modalController: ModalController;
    private idbAppFS: IdbAppFS;
    private appState: AppState;
    private platform: Platform;
    private changeDetectorRef: ChangeDetectorRef;

    /**
     * @constructor
     * @param {NavController}
     * @param {AlertController}
     * @param {ModalController}
     * @param {IdbAppFS}
     * @param {AppState}
     * @param {Platform}
     */
    constructor(
        navController: NavController,
        alertController: AlertController,
        actionSheetController: ActionSheetController,
        modalController: ModalController,
        changeDetectorRef: ChangeDetectorRef,
        idbAppFS: IdbAppFS,
        appState: AppState,
        platform: Platform
    ) {
        console.log('constructor():OrganizerPage');
        this.appState = appState;
        this.changeDetectorRef = changeDetectorRef;
        this.fileSystem = null;
        this.entries = [];
        this.directoryEntry = null;
        this.platform = platform;
        this.nChecked = 0;
        this.actionSheetController = actionSheetController;

        // get the filesystem
        FS.getFileSystem(true, REQUEST_SIZE).subscribe(
            (fileSystem: FileSystem) => {
                // remember the filesystem you got
                this.fileSystem = fileSystem;
                // create the /Unfiled/ folder if not already there
                FS.getPathEntry(fileSystem, '/Unfiled/', true).subscribe(
                    (directoryEntry: DirectoryEntry) => {
                        console.log('Created /Unfiled/');
                        // get last viewed folder to switch to it
                        this.appState.getProperty('lastViewedFolderPath').then(
                            (path: string) => {
                                this.switchFolder(path, false);
                            }
                        ); // State.getProperty('lastViewedFolderPath').then(..
                    },
                    (err3: any) => {
                        alert('err3: ' + err3);
                    }
                ); // FS.getPathEntry(..).subscribe(..
            }
        ); // FS.getFileSystem(true).subscribe(..

        this.navController = navController;
        this.alertController = alertController;
        this.modalController = modalController;

        const atHome: () => boolean = () => {
            return this.directoryEntry &&
                this.directoryEntry.name === '' &&
                this.directoryEntry.fullPath === '/';
        };

        this.headerButtons = [{
                text: 'Select...',
                leftIcon: this.platform.is('ios') ?
                    'radio-button-off' : 'square-outline',
                rightIcon: 'md-arrow-dropdown',
                clickCB: () => {
                    this.onClickSelectButton();
                },
                disabledCB: () => {
                    return !this.entries.length;
                }
            },
            {
                text: 'Go home',
                leftIcon: 'home',
                clickCB: () => {
                    this.onClickHomeButton();
                },
                disabledCB: atHome
            },
            {
                text: 'Go to parent',
                leftIcon: 'arrow-up',
                // rightIcon: 'folder',
                rightIcon: 'ios-folder-outline',
                clickCB: () => {
                    this.onClickParentButton();
                },
                disabledCB: atHome
            },
            {
                text: 'Add...',
                leftIcon: 'add',
                clickCB: () => {
                    this.onClickAddButton();
                }
            }
        ];

        this.footerButtons = [{
                text: 'Info',
                leftIcon: 'information-circle',
                clickCB: () => {
                    this.onClickInfoButton();
                }
            },
            {
                text: 'Move to...',
                leftIcon: 'share-alt',
                rightIcon: 'folder',
                clickCB: () => {
                    this.onClickMoveButton();
                },
                disabledCB: () => {
                    return this.moveButtonDisabled();
                }
            },
            {
                text: 'Delete',
                leftIcon: 'trash',
                clickCB: () => {
                    this.onClickDeleteButton();
                },
                disabledCB: () => {
                    return this.deleteButtonDisabled();
                }
            },
            {
                text: 'Share',
                leftIcon: 'md-share',
                clickCB: () => {
                    this.onClickShareButton();
                }
            }
        ];
    }
    /**
     * Switch to a new folder
     * @param {number} key of treenode corresponding to folder to switch to
     * @param {boolean} whether to update app state 'lastFolderViewed' property
     * @returns {void}
     */
    private switchFolder(path: string, bUpdateAppState: boolean = true) {
        console.log('OrganizerPage.switchFolder(' + path + ', ' + bUpdateAppState + ')');
        FS.getPathEntry(
            this.fileSystem,
            path,
            false
        ).subscribe(
            (directoryEntry: DirectoryEntry) => {
                this.directoryEntry = directoryEntry;
                if (!directoryEntry) {
                    alert('!directoryEntry!');
                }
                FS.readDirectory(
                    directoryEntry
                ).subscribe(
                    (entries: Entry[]) => {
                        console.log('entries: ' + entries);
                        console.dir(entries);
                        this.entries = entries;
                        this.detectChanges();
                        if (bUpdateAppState) {
                            this.appState.updateProperty(
                                'lastViewedFolderPath',
                                path
                            ).then();
                        }
                    },
                    (err1: any) => {
                        alert('err1: ' + err1);
                    }
                ); // FS.readDirectory().susbscribe(..
            },
            (err2: any) => {
                alert('err2: ' + err2);
            }
        ); // FS.getPathEntry(..).subscribe(..
    }

    public entryIcon(entry: Entry): string {
        return entry.isDirectory ? 'folder' : 'play';
    }

    /**
     * https://webcake.co/page-lifecycle-hooks-in-ionic-2/
     * @returns {void}
     */
    // public ionViewWillEnter(): void {
    //     console.log('OrganizerPage.ionViewWillEnter()');
    // }

    /**
     * Moves items in DB and in UI when move button is clicked
     * @returns {void}
     */
    public onClickMoveButton(): void {
        console.log('onClickMoveButton');
        // this.modalController.create(MoveToPage).present();
        this.navController.push(MoveToPage);
    }

    /**
     * Moves items in DB and in UI when more button is clicked
     * @returns {void}
     */
    public onClickMoreButton(): void {
        console.log('onClickMoreButton');
    }

    /**
     * Deletes selected nodes when delete button gets clicked
     * @returns {void}
     */
    public onClickDeleteButton(): void {
        console.log('onClickDeleteButton()');
    }

    /**
     * @returns {void}
     */
    public onClickShareButton(): void {
        console.log('onClickShareButton()');
    }

    /**
     * Initiates sharing selected items when share button gets clicked
     * @returns {boolean}
     */
    public moreButtonDisabled(): boolean {
        return false;
    }

    /**
     * UI callback for sharing the selected items when share button is clicked
     * @returns{void}
     */
    public onClickSharebutton(): void {
        console.log('onClickSharebutton');
    }

    /**
     * Determine whether the move button should be disabled in the UI
     * @returns {boolean}
     */
    public moveButtonDisabled(): boolean {
        return false;
    }

    /**
     * Determine whether the delete button should be disabled in the UI
     * @returns {boolean}
     */
    public deleteButtonDisabled(): boolean {
        // return this.selectedNodes[UNFILED_FOLDER_KEY];
        return false;
    }

    private detectChanges(): void {
        console.log('OrganizerPage.detectChanges()');
        setTimeout(
            () => {
                this.changeDetectorRef.detectChanges();
                this.content.resize();
            },
            0);
    }

    public ionViewWillEnter(): void {
        console.log('OrganizerPage.ionViewWillEnter()');
        this.detectChanges();
    }

    public ionViewDidEnter(): void {
        console.log('OrganizerPage.ionViewDidEnter()');
        this.detectChanges();
    }

    /**
     * UI calls this when the goHome button is clicked
     * @returns {void}
     */
    public onClickHomeButton(): void {
        console.log('onClickHomeButton()');
    }

    /**
     * Initiates select button action when that button is clicked
     * @returns {void}212 660 1st 38th gnd flr 263 6246
     */
    public onClickSelectedBadge(): void {
        console.log('onClickSelectedBadge()');
        // this.navController.push(EditSelectionPage);
    }

    /**
     * Initiates select button action when that button is clicked
     * @returns {void}
     */
    public onClickSelectButton(): void {
        console.log('onClickSelectButton()');

        let alert: Alert = this.alertController.create();
        alert.setTitle('Select which, in ' + this.directoryEntry.fullPath);
        alert.addButton({
            text: 'All',
            handler: () => {
                this.selectAllInFolder();
            }
        });
        alert.addButton({
            text: 'None',
            handler: () => {
                this.selectNoneInFolder();
            }
        });

        alert.addButton('Cancel');
        alert.present();
    }

    /**
     * UI calls this when the goToParent button is clicked
     * @returns {void}
     */
    public onClickParentButton(): void {
        console.log('onClickParentButton()');
    }

    /**
     * UI calls this when the new folder button is clicked
     * @returns {void}
     */
    public onClickRename(node: TreeNode, item: ItemSliding): void {
        console.log('onClickRename()');
    }

    /**
     * UI calls this when the new folder button is clicked
     * @returns {void}
     */
    public onClickEntry(entry: Entry): void {
        console.log('onClickEntry(' + entry + ')');
        console.dir(entry);
    }

    public onCheckEntry(entry: Entry): void {
        console.log('onCheckEntry(' + entry + ')');
        if (entry[CHECKED_KEY]) {
            entry[CHECKED_KEY] = false;
            this.nChecked--;
        }
        else {
            entry[CHECKED_KEY] = true;
            this.nChecked++;
        }
    }

    public onRenameEntry(entry: Entry): void {
        console.log('onRenameEntry(' + entry + '');
    }

    /**
     * UI calls this when the new folder button is clicked
     * @returns {void}
     */
    public onClickAddButton(): void {
        console.log('onClickAddButton()');
        let actionSheet: ActionSheet = this.actionSheetController.create({
            title: 'Create new ... in ' + this.directoryEntry.fullPath,
            buttons: [{
                    text: 'Folder',
                    icon: 'folder',
                    handler: () => {
                        console.log('Add folder clicked.');
                        this.onClickNewFolder();
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
     * UI calls this when the new folder button is clicked
     * @returns {void}
     */
    public onClickNewFolder(): void {
        let parentPath: string =this.directoryEntry.fullPath+'/',
            alert: Alert = this.alertController.create({
            title: 'Create a new folder in ' + this.directoryEntry.fullPath,
            // message: 'Enter the folder name',
            inputs: [{
                name: 'folderName',
                placeholder: 'Enter folder name...'
            }],
            buttons: [{
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked in new-folder alert');
                    }
                },
                {
                    text: 'Done',
                    handler: (data: any) => {
                        let folderName: string = data.folderName;
                        if (!folderName.length) {
                            return;
                        }
                        if (folderName[folderName.length-1] !== '/') {
                            folderName += '/';
                        }
                        // create the folder via getPathEntry()
                        FS.getPathEntry(
                            this.fileSystem,
                            parentPath + folderName,
                            true
                        ).subscribe(
                            (directoryEntry: DirectoryEntry) => {
                                // re-read parent
                                // to load in new info
                                this.switchFolder(parentPath, false);
                            }
                        );
                    }
                }
            ]
        });
        alert.present();
    }

    /**
     * UI calls this when the info button (of selected items) clicked
     * @returns {void}
     */
    public onClickInfoButton(): void {
        console.log('onClickInfoButton');
    }

    /**
     * Select all or no items in current folder, depending on 'all; argument
     * @params {boolean} if true, select all, if false, select none
     * @returns {void}
     */
    private selectAllOrNoneInFolder(bCheck: boolean): void {
        let bChanged: boolean = false;
        for (let i: number = 0; i < this.entries.length; i++) {
            let entry: Entry = this.entries[i];
            if ((bCheck && !entry[CHECKED_KEY]) ||
                (!bCheck && entry[CHECKED_KEY])) {
                // must change node status
                this.onCheckEntry(entry);
                bChanged = true;
            }
        }
        if (bChanged) {
            console.log('Something changed: updating app-state');
        }
    }

    /**
     * Select all items in current folder
     * @returns {void}
     */
    private selectAllInFolder(): void {
        this.selectAllOrNoneInFolder(true);
    }

    /**
     * Get rid of selection on all nodes in current folder
     * @returns {void}
     */
    private selectNoneInFolder(): void {
        this.selectAllOrNoneInFolder(false);
    }

    public reorderingEntries(): boolean {
        return this.entries.length > 1;
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
