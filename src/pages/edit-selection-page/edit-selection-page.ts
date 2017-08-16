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
import { TreeNode, KeyDict, ROOT_FOLDER_KEY, DB_KEY_PATH } from '../../models/idb/idb-fs';
import { getFolderPath } from '../library-page/library-page'
import { ButtonbarButton } from '../../components/button-bar/button-bar';
import { isPositiveWholeNumber, isUndefined } from '../../models/utils/utils';

/**
 * @name EditSelectionPage
 * @description
 * A modal EditSelection page that displays a selection / browser of files
 * and folders to move items into - you must select a folder here.
 */
@Component({
    selector: 'edit-selection-page',
    templateUrl: 'edit-selection-page.html'
})
export class EditSelectionPage {
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
     * EditSelectionPage modal constructor
     */
    constructor(
        idbAppFS: IdbAppFS,
        appState: AppState,
        viewController: ViewController,
        platform: Platform
    ) {
        console.log('constructor():EditSelectionPage');
        this.idbAppFS = idbAppFS;
        this.appState = appState;
        this.viewController = viewController;
        this.selectedNodes = {};
        this.headerButtons = [{
                text: 'To /',
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
        this.footerButtons = [{
            text: 'Move selected  items here',
            leftIcon: 'checkmark-circle',
            clickCB: () => {
                console.log('move cb clicked');
            }
        }];
    }

    /**
     * Template loop function that enumerates keys of an object
     * @returns {Array<String>} array of keys in 'obj'
     */
    private keys(obj: Object) {
        return Object.keys(obj);
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
        console.log('EditSelectionPage:onClickListItem()');
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

    /**
     * Used by UI to determine whether 'node' is selected
     * @param {TreeNode} node about which we ask if it's selected
     * @returns {TreeNode} if 'node' is selected, undefined otherwise.
     */
    public isSelected(node: TreeNode): boolean {
        return !isUndefined(this.selectedNodes[node[DB_KEY_PATH]]);
    }

    /**
     * UI calls this when a UI item gets checked
     * @param {TreeNode} node corresponding to UI item that just got checked
     * @returns {void}
     */
    public onClickCheckbox(node: TreeNode): void {
        console.log('onClickCheckbox');

        const nodeKey: number = node[DB_KEY_PATH],
            nSelected: number = Object.keys(this.selectedNodes).length,
            selectedNode: TreeNode = this.selectedNodes[nodeKey];

        if (selectedNode) {
            // the node is selected, meaning it is checked, uncheck it
            delete this.selectedNodes[nodeKey];
        }
        else {
            // not selected, check it
            this.selectedNodes[nodeKey] = node;

        }

        // update state with new list of selected nodes
        this.appState.updateProperty('selectedNodes', this.selectedNodes)
            .then();
    }

}
