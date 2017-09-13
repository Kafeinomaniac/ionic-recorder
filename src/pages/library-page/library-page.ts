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

export function getFolderPath(folderNode: TreeNode): string {
    'use strict';
    const path: string = folderNode.path + '/' + folderNode.name;
    return (path === '/') ? path : path.slice(1);
}

/**
 * @name LibraryPage
 * @description
 * Page of file/folder interface to all recorded files. AddFolderPage
 * music organizer.
 */
@Component({
    selector: 'library-page',
    templateUrl: 'library-page.html'
})
export class LibraryPage {
    @ViewChild(Content) public content: Content;
    public folderNode: TreeNode;
    public headerButtons: ButtonbarButton[];
    public footerButtons: ButtonbarButton[];
    private navController: NavController;
    private alertController: AlertController;
    private modalController: ModalController;
    private idbAppFS: IdbAppFS;
    private appState: AppState;
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
        console.log('constructor():LibraryPage');
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
            text: 'Select',
            leftIcon: platform.is('ios') ?
                'radio-button-off' : 'square-outline',
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
                                  text: 'New folder',
                                  leftIcon: 'add',
                                  rightIcon: 'folder',
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
                                  text: 'Move',
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
     * https://webcake.co/page-lifecycle-hooks-in-ionic-2/
     * @returns {void}
     */
    public ionViewWillEnter(): void {
        this.appState.get('selectedNodes').then(
            (selectedNodes: any) => {
                this.selectedNodes = selectedNodes;
                this.appState.get('lastViewedFolderKey')
                    .then(
                        (lastViewedFolderKey: any) => {
                            // swich folders, according to AppState
                            this.switchFolder(lastViewedFolderKey, false);
                            console.log(
                                'LibraryPage:ionViewWillEnter(): ' +
                                    'lastViewedFolderKey=' +
                                    lastViewedFolderKey);
                        });
            }
        );
    }

    /**
     * Computes a string representation of folder path (tree node path)
     * @returns {string} folder path, represented as a string
     */
    public getPath(): string {
        return getFolderPath(this.folderNode);
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
     * Returns dictionary of nodes selected in current folder
     * @returns {KeyDict} dictionary of nodes selected here
     */
    private selectedNodesHere(): KeyDict {
        let key: string,
            i: number,
            nodeHere: TreeNode,
            keyDict: KeyDict = {},
            keys: string[] = Object.keys(this.selectedNodes);
        for (i = 0; i < keys.length; i++) {
            key = keys[i];
            nodeHere = this.folderItems[key];
            if (nodeHere) {
                keyDict[key] = nodeHere;
            }
        }
        return keyDict;
    }

    /**
     * Delete nodes from  UI and from local DB
     * @param {KeyDict} dictionary of nodes to delete
     * @returns {void}
     */
    private deleteNodes(keyDict: KeyDict): void {
        let keys: string[] = Object.keys(keyDict),
            nNodes: number = keys.length;
        if (!nNodes) {
            alert('wow no way!');
        }
        alertAndDo(
            this.alertController,
            'Permanently delete ' + nNodes + ' item' +
                (nNodes > 1 ? 's?' : '?'),
            'Ok',
            () => {
                console.log('Library::deleteNodes(): deleting ' + nNodes +
                            ' selected items ...');
                this.idbAppFS.deleteNodes(keyDict).subscribe(
                    () => {
                        let i: number,
                            bSelectionChanged: boolean = false,
                            key: string;

                        for (i = 0; i < nNodes; i++) {
                            key = keys[i];
                            // remove from this.folderNode.childOrder
                            this.folderNode.childOrder =
                                this.folderNode.childOrder.filter(
                                    (childKey: number) => {
                                        return childKey.toString() !== key;
                                    });
                            // remove from this.folderItems
                            if (this.folderItems[key]) {
                                delete this.folderItems[key];
                            }
                            // remove from this.selectedNodes
                            if (this.selectedNodes[key]) {
                                delete this.selectedNodes[key];
                                // remember that we've changed selection
                                bSelectionChanged = true;
                            }
                        } // for (i = 0; i < nNodes; i++) {
                        if (bSelectionChanged) {
                            this.appState.set(
                                'selectedNodes',
                                this.selectedNodes).then();
                        }
                        else {
                            console.log('SUCCESS DELETING ALL');
                        }
                    }
                );
            });
    }

    /**
     * Checks if selected nodes are only in current folder, if not prompts user
     * for which nodes s/he wants to delete and proceedes with deletion
     * @returns {void}
     */
    private checkIfDeletingInOtherFolders(): void {
        let nSelectedNodes: number = Object.keys(this.selectedNodes).length,
            selectedNodesHere: KeyDict =
            this.selectedNodesHere(),
            nSelectedNodesHere: number =
            Object.keys(selectedNodesHere).length,
            nSelectedNodesNotHere: number =
            nSelectedNodes - nSelectedNodesHere;

        if (nSelectedNodes === 0) {
            // for the case of unselecting only Unfiled folder in the alert
            // above and nothing is left in selected.  otherwise this condition
            // should never be met.
            return;
        }

        if (nSelectedNodesNotHere) {
            if (nSelectedNodesHere) {
                alertAndDo(
                    this.alertController, [
                        'You have ', nSelectedNodesNotHere,
                        ' selected item',
                        nSelectedNodesNotHere > 1 ? 's' : '',
                        ' outside this folder. Do you want to delete all ',
                        nSelectedNodes, ' selected item',
                        nSelectedNodes > 1 ? 's' : '',
                        ' or only the ', nSelectedNodesHere,
                        ' item', nSelectedNodesHere > 1 ? 's' : '',
                        ' here?'
                    ].join(''),
                    'Delete all (' + nSelectedNodes + ')',
                    () => {
                        console.log('no action');
                        this.deleteNodes(this.selectedNodes);
                    },
                    'Delete only here (' + nSelectedNodesHere + ')',
                    () => {
                        console.log('yes action');
                        this.deleteNodes(selectedNodesHere);
                    }
                );
            }
            else {
                // nothing selected in this folder, but stuff selected outside
                this.deleteNodes(this.selectedNodes);
            }
        }
        else {
            // all selected nodes are in this folder
            this.deleteNodes(selectedNodesHere);
        }
    }

    /**
     * Deletes selected nodes when delete button gets clicked
     * @returns {void}
     */
    public onClickDeleteButton(): void {
        if (this.selectedNodes[UNFILED_FOLDER_KEY]) {
            console.log('onClickDeleteButton()');
            alertAndDo(
                this.alertController, [
                    'The Unfiled folder is selected for deletion, ',
                    'but the Unfiled folder cannot be deleted. Unselect it ',
                    'and delete the rest?'
                ].join(''),
                'Yes',
                () => {
                    delete this.selectedNodes[UNFILED_FOLDER_KEY];
                    this.checkIfDeletingInOtherFolders();
                }
            );
        }
        else {
            this.checkIfDeletingInOtherFolders();
        }
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

    // switch to folder whose key is 'key'
    // if updateState is true, update the app state
    // property 'lastViewedFolderKey'
    private switchFolder(key: number, updateState: boolean): void {
        if (!isPositiveWholeNumber(key)) {
            alert('switchFolder -- invalid key! key=' + key);
            return;
        }
        /*
          TODO: without the alert we may want the return statement here
          if (this.folderNode && this.folderNode[DB_KEY_PATH] === key) {
          // we're already in that folder
          alert('why switch twice in a row to the same folder?');
          return;
          }
        */
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
                        this.resize();
                    },
                    (err: any) => {
                        alert('in readChildNodes: ' + err);
                    }
                ); // readChildNodes().subscribe(
            },
            (error: any) => {
                alert('in readNode: ' + error);
            }
        );

        // update last viewed folder state in DB
        if (updateState) {
            this.appState.set('lastViewedFolderKey', key).then();
        }
    }

    /**
     * Used by UI to determine whether 'node' is selected
     * @param {TreeNode} node about which we ask if it's selected
     * @returns {TreeNode} if 'node' is selected, undefined otherwise.
     */
    public isSelected(node: TreeNode): boolean {
        return !isUndefined(this.selectedNodes[node[DB_KEY_PATH]]);
    }

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
            if (nSelected === 1) {
                // we're about to transition from something selected to nothing
                // selected, i.e. footer will disappear, resize after delay
                this.resize();
            }
        }
        else {
            // not selected, check it
            this.selectedNodes[nodeKey] = node;
            if (nSelected === 0) {
                // we're about to transition from nothing selected to something
                // selected, i.e. footer will appear, resize after delay
                this.resize();
            }
        }

        // update state with new list of selected nodes
        this.appState.set('selectedNodes', this.selectedNodes)
            .then();
    }

    /**
     * UI calls this when a list item (name) is clicked
     * @returns {void}
     */
    public onClickListItem(node: TreeNode): void {
        console.log('onClickListItem');
        const key: number = node[DB_KEY_PATH];
        // const nodeKey: number = node[DB_KEY_PATH];
        if (IdbAppFS.isFolderNode(node)) {
            // it's a folder! switch to it
            this.switchFolder(key, true);
        }
        else {

            // ***TODO*** only send id here, deduce every other piece
            // of info in the track-page page code

            // console.dir(node);
            this.navController.push(TrackPage, key);
        } // if (IdbAppFS.isFolderNode(node)) { .. else { ..
    }

    /**
     * UI calls this when the goHome button is clicked
     * @returns {void}
     */
    public onClickHomeButton(): void {
        console.log('onClickHomeButton()');
        if (this.folderNode) {
            this.switchFolder(ROOT_FOLDER_KEY, true);
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
        if (this.folderNode) {
            this.switchFolder(this.folderNode.parentKey, true);
        }
    }

    /**
     * UI calls this when the new folder button is clicked
     * @returns {void}
     */
    public onClickRename(node: TreeNode, item: ItemSliding): void {
        console.log('onClickNewFolder() - navController: ' +
                    this.navController);
        const displayType: string =
              IdbAppFS.isFolderNode(node) ? 'folder' : 'track';
        let alert: Alert = this.alertController.create({
            title: 'Rename ' + displayType + ':' ,
            // message: 'Enter the folder name',
            inputs: [{
                name: 'name',
                placeholder: node.name
            }],
            buttons: [
                {
                    text: 'Cancel',
                    handler: (data: any) => {
                        console.log('Cancel clicked in rename alert');
                        item.close();
                    }
                },
                {
                    text: 'Done',
                    handler: (data: any) => {
                        console.log('Done clicked in rename alert');
                        console.log('New name entered: ' + data.name);
                        node.name = data.name;
                        this.idbAppFS.updateNode(
                            node[DB_KEY_PATH],
                            node
                        ).subscribe(
                            () => {
                                item.close();
                            },
                            (err: any) => {
                                throw Error(err);
                            }
                        );
                    }
                }
            ]
        });
        alert.present();
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
                placeholder: 'Folder name ...'
            }],
            buttons: [{
                text: 'Cancel',
                handler: (data: any) => {
                    console.log('Cancel clicked in new-folder alert');
                    this.idbAppFS.createNode(
                        data.folderName,
                        this.folderNode[DB_KEY_PATH]
                    );
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
                                      const childNode: TreeNode =
                                            parentChild.child,
                                            parentNode: TreeNode =
                                            parentChild.parent,
                                            childNodeKey: number =
                                            childNode[DB_KEY_PATH];
                                      console.log('childNode: ' +
                                                  childNode.name +
                                                  ', parentNode: ' +
                                                  parentNode.name);
                                      // console.dir(childNode);
                                      // update folder items dictionary
                                      // of this page
                                      this.folderItems[childNodeKey] =
                                          childNode;
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
            this.appState.set(
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
