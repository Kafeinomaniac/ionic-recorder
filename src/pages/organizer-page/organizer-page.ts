// Copyright (c) 2017 Tracktunes Inc

import {
    Alert,
    AlertController,
    Content,
    ItemSliding,
    ModalController,
    NavController,
    Platform
} from 'ionic-angular';
import { alertAndDo } from '../../models/utils/alerts';
import { AppState } from '../../services/app-state/app-state';
import { ButtonbarButton } from '../../components/button-bar/button-bar';
import { Component, ViewChild } from '@angular/core';
import {
    DB_KEY_PATH,
    KeyDict,
    ParentChild,
    ROOT_FOLDER_KEY,
    TreeNode
} from '../../models/idb/idb-fs';
import { EditSelectionPage } from '../edit-selection-page/edit-selection-page';
import {
    IdbAppFS,
    UNFILED_FOLDER_KEY
} from '../../services/idb-app-fs/idb-app-fs';
import { isPositiveWholeNumber, isUndefined } from '../../models/utils/utils';
import { MoveToPage, TrackPage } from '../';

import { FS } from '../../models/filesystem/filesystem';

export function getPath(folderNode: TreeNode): string {
    'use strict';
    const path: string = folderNode.path + '/' + folderNode.name;
    return (path === '/') ? path : path.slice(1);
}

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

    public folderNode: TreeNode;
    public headerButtons: ButtonbarButton[];
    public footerButtons: ButtonbarButton[];
    private navController: NavController;
    private alertController: AlertController;
    private modalController: ModalController;
    private idbAppFS: IdbAppFS;
    private appState: AppState;
    private platform: Platform;
    private folderItems: KeyDict;
    private selectedNodes: KeyDict;

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
        modalController: ModalController,
        idbAppFS: IdbAppFS,
        appState: AppState,
        platform: Platform
    ) {
        console.log('constructor():OrganizerPage');
        this.fileSystem = null;
        this.entries = [];
        this.platform = platform;

        FS.getFileSystem(true).subscribe(
            (fileSystem: FileSystem) => {
                this.fileSystem = fileSystem;
                // TODO: get the directory to
                // start with from storage as
                // the last one you were at. for
                // now we start with root
                FS.readDirectory(this.fileSystem.root).subscribe(
                    (entries: Entry[]) => {
                        console.log('got entries: ' +
                            entries);
                        console.dir(entries);
        		        this.entries = entries;
                    }
                );
            }
        );

        this.navController = navController;
        this.alertController = alertController;
        this.modalController = modalController;
        this.idbAppFS = idbAppFS;
        this.appState = appState;
        this.folderNode = null;
        this.folderItems = {};
        this.selectedNodes = {};

        const atHome: () => boolean = () => {
            return this.folderNode &&
                this.folderNode[DB_KEY_PATH] === ROOT_FOLDER_KEY;
        };

        this.headerButtons = [{
                text: 'Select...',
                leftIcon: this.getUncheckedIconName(),
                rightIcon: 'md-arrow-dropdown',
                clickCB: () => {
                    this.onClickSelectButton();
                }
            },
            {
                text: 'To /',
                leftIcon: 'home',
                clickCB: () => {
                    this.onClickHomeButton();
                },
                disabledCB: atHome
            },
            {
                text: 'To parent',
                leftIcon: 'arrow-up',
                rightIcon: 'folder',
                clickCB: () => {
                    this.onClickParentButton();
                },
                disabledCB: atHome
            },
            {
                text: 'Add...',
                leftIcon: 'add',
                clickCB: () => {
                    this.onClickNewFolder();
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

    private getCheckedIconName(): string {
        return this.platform.is('ios') ? 'ios-checkmark-circle' : 'md-checkbox';
    }

    private getUncheckedIconName(): string {
        return this.platform.is('ios') ? 'radio-button-off' : 'square-outline';
    }

    public checkboxIconName(entry: Entry): string {
        return entry['isChecked'] ?
            this.getCheckedIconName() :
            this.getUncheckedIconName();
    }

    public itemIconName(entry: Entry): string {
        return entry.isDirectory ? 'folder' : 'play';
    }

    /**
     * https://webcake.co/page-lifecycle-hooks-in-ionic-2/
     * @returns {void}
     */
    public ionViewWillEnter(): void {
    }

    /**
     * Computes a string representation of folder path (tree node path)
     * @returns {string} folder path, represented as a string
     */
    public getPath(): string {
        return getPath(this.folderNode);
    }

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
     * Used to tell UI the number of currently selected nodes
     * @returns {number} number of currently selected nodes
     */
    public nSelectedNodes(): number {
        return Object.keys(this.selectedNodes).length;
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

    /**
     * Switch to a new folder
     * @param {number} key of treenode corresponding to folder to switch to
     * @param {boolean} whether to update app state 'lastFolderViewed' property
     * @returns {void}
     */

    private resize(): void {
        setTimeout(
            () => {
                this.content.resize();
            },
            20);
    }

    public ionViewDidEnter(): void {
        this.resize();
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
     * @returns {void}
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
        alertAndDo(
            this.alertController,
            'Select which, in ' + this.getPath(),
            'All',
            () => {
                console.log('action1 doing it now');
                this.selectAllInFolder();
            },
            'None',
            () => {
                console.log('action2 doing it now');
                this.selectNoneInFolder();
            });
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
        if (entry['isChecked']) {
            entry['isChecked'] = false;
        }
        else {
            entry['isChecked'] = true;
        }
    }

    public onRenameEntry(entry: Entry): void {
        console.log('onRenameEntry(' + entry + '');
    }

    /**
     * UI calls this when the new folder button is clicked
     * @returns {void}
     */
    public onClickNewFolder(): void {
        console.log('onClickNewFolder() - navController: ' +
            this.navController);

        let alert: Alert = this.alertController.create({
            title: 'New Folder',
            // message: 'Enter the folder name',
            inputs: [{
                name: 'folderName',
                placeholder: 'Enter folder name...'
            }],
            buttons: [{
                    text: 'Cancel',
                    handler: (data: any) => {
                        console.log('Cancel clicked in new-folder alert');
                        this.idbAppFS.createNode(
                            data.folderName,
                            this.folderNode[DB_KEY_PATH]
                        )
                    }
                },
                {
                    text: 'Done',
                    handler: (data: any) => {
                        console.log('Done clicked in new-folder alert');
                        this.idbAppFS.createNode(
                            data.folderName,
                            this.folderNode[DB_KEY_PATH]
                        ).subscribe(
                            (parentChild: ParentChild) => {
                                const childNode: TreeNode = parentChild.child,
                                    parentNode: TreeNode = parentChild.parent,
                                    childNodeKey: number =
                                        childNode[DB_KEY_PATH];
                                console.log('childNode: ' + childNode.name +
                                    ', parentNode: ' + parentNode.name);
                                // console.dir(childNode);
                                // update folder items dictionary of this page
                                this.folderItems[childNodeKey] = childNode;
                                this.folderNode = parentNode;
                            }
                        ); // createFolderNode().subscribe(
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
    private selectAllOrNoneInFolder(selectAll: boolean): void {
        // go through all folderItems
        // for each one, ask if it's in selectedNodes
        // for this to work, we need to make selectedNodes a dictionary
        let changed: boolean = false,
            folderItemsKeys: string[] = Object.keys(this.folderItems),
            i: number,
            key: string,
            itemNode: TreeNode,
            itemKey: number;
        // loop over folderItems (the current showing folder's items)
        // because that's where select-all or select-none will apply, i.e.
        // when we choose select-all, 'all' refers to all items here, not
        // all items everywhere
        for (i = 0; i < folderItemsKeys.length; i++) {
            key = folderItemsKeys[i];
            itemNode = this.folderItems[key];
            itemKey = itemNode[DB_KEY_PATH];

            let selectedNode: TreeNode = this.selectedNodes[itemKey];
            console.log('i: ' + i + ', selected node: ' + selectedNode);
            if (selectAll && !selectedNode) {
                // not selected, check it
                changed = true;
                this.selectedNodes[itemKey] = itemNode;
            }
            else if (!selectAll && selectedNode) {
                // selected, uncheck it
                changed = true;
                delete this.selectedNodes[itemKey];
            }
        }
        if (changed) {
            console.log('CHANGED!!!!!!!!!!!!!!!!!!!!! ' +
                Object.keys(this.selectedNodes).length);
            // update state with new list of selected nodes
            // TODO: handle errors here
            this.appState.updateProperty(
                'selectedNodes',
                this.selectedNodes).then();

            // resize if anything changed
            this.resize();
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
}
