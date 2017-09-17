// Copyright (c) 2017 Tracktunes Inc

import { AppState } from '../../services/app-state/app-state';
import { ButtonbarButton } from '../../components/button-bar/button-bar';
import { Component, ViewChild } from '@angular/core';
import { getFolderPath } from '../library-page/library-page';
import { IdbAppFS } from '../../services/idb-app-fs/idb-app-fs';
import { isUndefined } from '../../models/utils/utils';
import {
    // AlertController,
    Content,
    // ModalController,
    // NavController,
    Platform,
    ViewController
} from 'ionic-angular';
import {
    // DB_KEY_PATH,
    IdbFS,
    KeyDict,
    // ROOT_FOLDER_KEY,
    TreeNode
} from '../../models/idb/idb-fs';

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
    private origSelectedNodes: KeyDict;
    // private folderItems: KeyDict;
    public folderNode: TreeNode;
    public headerButtons: ButtonbarButton[];
    public footerButtons: ButtonbarButton[];
    public isReady: boolean;

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
        this.origSelectedNodes = {};
        this.isReady = false;
    }

    /**
     * Template loop function that enumerates keys of an object
     * @returns {string[]} array of keys in 'obj'
     */
    // private keys(obj: Object): string[] {
    //     return Object.keys(obj);
    // }

    /**
     * Computes a string representation of folder path (tree node path)
     * @returns {string} folder path, represented as a string
     */
    public getPath(): string {
        return getFolderPath(this.folderNode);
    }

    public isFolderKey(key: string): boolean {
        // console.log('isFolderKey(' + key + ')');
        if (isUndefined(this.origSelectedNodes[key])) {
            alert('undefd');
        }
        return IdbFS.isFolderNode(this.origSelectedNodes[key]);
    }

    public isDataKey(key: string): boolean {
        // console.log('isDataKey(' + key + ')');
        if (isUndefined(this.origSelectedNodes[key])) {
            alert('undefined problem in edit selection page');
        }
        return IdbFS.isDataNode(this.origSelectedNodes[key]);
    }

    public getName(key: string): string {
        return this.origSelectedNodes[key].name;
    }

    /**
     * https://webcake.co/page-lifecycle-hooks-in-ionic-2/
     * @returns {void}
     */
    public ionViewWillEnter(): void {
        console.log('EditSelectionPage:ionViewWillEnter()');
        this.appState.get('selectedNodes').then(
            (selectedNodes: any) => {
                this.selectedNodes = selectedNodes;
                Object.keys(this.selectedNodes).forEach((key: string) => {
                    this.origSelectedNodes[key] = this.selectedNodes[key];
                });
                this.isReady = true;
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
     * Used by UI to determine whether 'node' is selected
     * @param {TreeNode} node about which we ask if it's selected
     * @returns {TreeNode} if 'node' is selected, undefined otherwise.
     */
    public isSelected(key: string): boolean {
        return !isUndefined(this.selectedNodes[key]);
    }

    /**
     * UI calls this when a UI item gets checked
     * @param {TreeNode} node corresponding to UI item that just got checked
     * @returns {void}
     */
    public onClickCheckbox(key: string): void {
        console.log('onClickCheckbox');

        if (this.isSelected(key)) {
            delete this.selectedNodes[key];
        }
        else {
            this.selectedNodes[key] = this.origSelectedNodes[key];
        }

        // update state with new list of selected nodes
        this.appState.set('selectedNodes', this.selectedNodes);
    }

}
