// Copyright (c) 2017 Tracktunes Inc

import { Component, ViewChild } from '@angular/core';
import {
    AlertController,
    NavController,
    ModalController,
    ViewController,
    Platform,
    Content
}
from 'ionic-angular';
import { IdbAppFS } from '../../services/idb-app-fs/idb-app-fs';
import { AppState } from '../../services/app-state/app-state';
import { TreeNode, KeyDict, DB_KEY_PATH } from '../../models/idb/idb-fs';
import { getFolderPath } from '../library-page/library-page'
import { ButtonbarButton } from '../../components/button-bar/button-bar';
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
    private selectedNodes: KeyDict;
    private folderItems: KeyDict;
    public folderNode: TreeNode;
    public headerButtons: ButtonbarButton[];
    public footerButtons: ButtonbarButton[];

    /**
     * MoveToPage modal constructor
     */
    constructor(
        idbAppFS: IdbAppFS,
        appState: AppState,
        viewController: ViewController,
        platform: Platform
    ) {
        console.log('constructor():MoveToPage');
        this.idbAppFS = idbAppFS;
        this.appState = appState;
        this.viewController = viewController;
        this.selectedNodes = {};
        this.headerButtons = [{
                text: 'Home',
                leftIcon: 'home',
                clickCB: () => {
                    this.onClickHomeButton();
                }
            },
            {
                text: 'To parent',
                leftIcon: 'arrow-up',
                rightIcon: 'folder',
                clickCB: () => {
                    this.onClickParentButton();
                }
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
        this.footerButtons = [
            {
                text: 'Cancel',
                leftIcon: 'close',
                clickCB: () => {
                    console.log('clicked cancel');
                    this.dismiss();
                }
            },
            {
                text: 'Move items here',
                leftIcon: 'share-alt',
                rightIcon: 'folder',
                clickCB: () => {
                    console.log('moving them here');
                }
            },
        ];
    }

    /**
     * UI calls this when the goToParent button is clicked
     * @returns {void}
     */
    public onClickAddButton(): void {
        console.log('onClickHomeButton()');
        if (this.folderNode) {
            this.switchFolder(this.folderNode.parentKey);
        }
    }
    /**
     * UI calls this when the goToParent button is clicked
     * @returns {void}
     */
    public onClickHomeButton(): void {
        console.log('onClickHomeButton()');
        if (this.folderNode) {
            this.switchFolder(this.folderNode.parentKey);
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
     * Computes a string representation of folder path (tree node path)
     * @returns {string} folder path, represented as a string
     */
    public getPath(): string {
        return getFolderPath(this.folderNode);
    }

    dismiss() {
        this.viewController.dismiss();
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
            // this.switchFolder(node[DB_KEY_PATH], true);
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
