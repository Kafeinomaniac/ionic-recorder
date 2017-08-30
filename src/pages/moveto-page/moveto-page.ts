// Copyright (c) 2017 Tracktunes Inc

import {
    Alert,
    AlertController,
    Content,
    // ModalController,
    NavController,
    Platform,
    ViewController
    } from 'ionic-angular';
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
import { getFolderPath } from '../library-page/library-page';
import { IdbAppFS } from '../../services/idb-app-fs/idb-app-fs';
import { isPositiveWholeNumber } from '../../models/utils/utils';

/**
 * @name MoveToPage
 * @description
 * A modal MoveTo page that displays a selection / browser of files
 * and folders to move items into - you must select a folder here.
 */
@Component({
    selector: 'moveto-page',
    templateUrl: 'moveto-page.html'
})
export class MoveToPage {
    @ViewChild(Content) public content: Content;
    private idbAppFS: IdbAppFS;
    private appState: AppState;
    private viewController: ViewController;
    private alertController: AlertController;
    private selectedNodes: KeyDict;
    private folderItems: KeyDict;
    public folderNode: TreeNode;
    public headerButtons: ButtonbarButton[];
    public footerButtons: ButtonbarButton[];
    private navController: NavController;

    /**
     * MoveToPage modal constructor
     */
    constructor(
        navController: NavController,
        idbAppFS: IdbAppFS,
        appState: AppState,
        viewController: ViewController,
        alertController: AlertController,
        platform: Platform
    ) {
        console.log('constructor():MoveToPage');
        this.navController = navController;
        this.idbAppFS = idbAppFS;
        this.appState = appState;
        this.viewController = viewController;
        this.alertController = alertController;
        this.selectedNodes = {};

        const atHome: () => boolean = () => {
            return this.folderNode &&
                this.folderNode[DB_KEY_PATH] === ROOT_FOLDER_KEY;
        };

        this.headerButtons = [{
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
                text: 'New folder',
                leftIcon: 'add',
                rightIcon: 'folder',
                clickCB: () => {
                    this.onClickAddButton();
                }
            }

        ];
        this.footerButtons = [{
            text: 'Move selected  items here',
            leftIcon: 'checkmark-circle',
            clickCB: () => {
                console.log('move cb clicked');
            }
        }];
    }

    /**
     * UI calls this when the new folder button is clicked
     * @returns {void}
     */
    public onClickAddButton(): void {
        console.log('onClickAddButton() - navController: ' +
            this.navController);

        let alert: Alert = this.alertController.create({
            title: 'New Folder',
            // message: 'Enter the folder name',
            inputs: [{
                name: 'folderName',
                placeholder: 'Folder name ...'
            }],
            buttons: [{
                    text: 'Cancel',
                    handler: (data: any) => {
                        console.log('Cancel clicked in add-folder alert');
                    }
                },
                {
                    text: 'Done',
                    handler: (data: any) => {
                        console.log('Done clicked in add-folder alert');
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
     * UI calls this when the goHome button is clicked
     * @returns {void}
     */
    public onClickHomeButton(): void {
        console.log('onClickHomeButton()');
        if (this.folderNode) {
            this.switchFolder(ROOT_FOLDER_KEY);
        }
    }

    /**
     * UI calls this when the goToParent button is clicked
     * @returns {void}
     */
    public onClickParentButton(): void {
        console.log('onClickParentButton()');
        if (this.folderNode) {
            this.switchFolder(this.folderNode.parentKey);
        }
    }

    /**
     * Initiates select button action when that button is clicked
     * @returns {void}
     */
    public onClickSelectedBadge(): void {
        console.log('onClickSelectedBadge()');
        this.navController.push(EditSelectionPage);
    }

    /**
     * Computes a string representation of folder path (tree node path)
     * @returns {string} folder path, represented as a string
     */
    public getPath(): string {
        return getFolderPath(this.folderNode);
    }

    /**
     * https://webcake.co/page-lifecycle-hooks-in-ionic-2/
     * @returns {void}
     */
    public ionViewWillEnter(): void {
        this.appState.getProperty('selectedNodes').then(
            (selectedNodes: any) => {
                this.selectedNodes = selectedNodes;
                this.appState.getProperty('lastViewedFolderKey')
                    .then(
                        (lastViewedFolderKey: any) => {
                            // swich folders, according to AppState
                            this.switchFolder(lastViewedFolderKey);
                            console.log(
                                'LibraryPage:ionViewWillEnter(): ' +
                                'lastViewedFolderKey=' +
                                lastViewedFolderKey);
                        });
            }
        );
    }
    /**
     * Used to tell UI the number of currently selected nodes
     * @returns {number} number of currently selected nodes
     */
    public nSelectedNodes(): number {
        return Object.keys(this.selectedNodes).length;
    }

    /**
     * UI calls this when a list item (name) is clicked
     * @returns {void}
     */
    public onClickListItem(node: TreeNode): void {
        console.log('MoveToPage:onClickListItem()');
        // const nodeKey: number = node[DB_KEY_PATH];
        if (IdbAppFS.isFolderNode(node)) {
            // it's a folder! switch to it
            this.switchFolder(node[DB_KEY_PATH]);
        }
    }

    // switch to folder whose key is 'key'
    // if updateState is true, update the app state
    // property 'lastViewedFolderKey'
    private switchFolder(key: number): void {
        if (!isPositiveWholeNumber(key)) {
            alert('switchFolder -- invalid key! key=' + key);
            return;
        }

        // console.log('switchFolder(' + key + ', ' + updateState + ')');

        // for non-root folders, we set this.folderNode here
        this.idbAppFS.readNode(key).subscribe(
            (folderNode: TreeNode) => {
                if (folderNode[DB_KEY_PATH] !== key) {
                    alert('in readNode: key mismatch');
                }
                // we read all child nodes of the folder we're
                // switching to in order to fill up this.folderItems
                let newFolderItems: {
                    [id: string]: TreeNode
                } = {};
                this.idbAppFS.readChildNodes(folderNode).subscribe(
                    (childNodes: TreeNode[]) => {
                        this.folderItems = {};
                        // we found all children of the node we're
                        // traversing to (key)
                        for (let i in childNodes) {
                            let childNode: TreeNode = childNodes[i],
                                childKey: number = childNode[DB_KEY_PATH];
                            newFolderItems[childKey] = childNode;
                        } // for
                        this.folderNode = folderNode;
                        this.folderItems = newFolderItems;
                        // resize content, because a change in this.folderNode
                        // can affect the header's visibility
                        this.content.resize();
                    },
                    (error: any) => {
                        alert('in readChildNodes: ' + error);
                    }
                ); // readChildNodes().subscribe(
            },
            (error: any) => {
                alert('in readNode: ' + error);
            }
        );
    }
}
