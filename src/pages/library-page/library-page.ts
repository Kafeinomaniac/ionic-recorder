// Copyright (c) 2017 Tracktunes Inc

import {
    /* tslint:disable */
    ChangeDetectorRef,
    /* tslint:enable */
    Component,
    ViewChild
} from '@angular/core';
import {
    ActionSheet,
    ActionSheetController,
    Alert,
    AlertController,
    Content,
    Modal,
    ModalController,
    NavController,
    Platform
} from 'ionic-angular';

import { AppFilesystem } from '../../services';
import { ButtonbarButton } from '../../components/';
import { MoveToPage, SelectionPage, TrackPage } from '../../pages';
import { folderPathParent } from '../../models';

/**
 * Files/folders music library page.
 * @class LibraryPage
 */
@Component({
    selector: 'library-page',
    templateUrl: 'library-page.html'
})
export class LibraryPage {
    @ViewChild(Content) public content: Content;
    public headerButtons: ButtonbarButton[];
    public footerButtons: ButtonbarButton[];
    protected modalController: ModalController;
    protected navController: NavController;
    private actionSheetController: ActionSheetController;
    private alertController: AlertController;
    private changeDetectorRef: ChangeDetectorRef;
    private appFilesystem: AppFilesystem;

    /**
     * @constructor
     * @param {ModalController}
     * @param {NavController}
     * @param {AlertController}
     * @param {ActionSheetController}
     * @param {ChangeDetectorRef}
     * @param {AppFilesystem}
     * @param {Platform}
     */
    constructor(
        modalController: ModalController,
        navController: NavController,
        alertController: AlertController,
        actionSheetController: ActionSheetController,
        changeDetectorRef: ChangeDetectorRef,
        appFilesystem: AppFilesystem,
        platform: Platform
    ) {
        console.log('constructor()');
        this.changeDetectorRef = changeDetectorRef;
        this.actionSheetController = actionSheetController;
        this.modalController = modalController;
        this.navController = navController;
        this.alertController = alertController;
        this.appFilesystem = appFilesystem;
        this.headerButtons = [
            {
                text: 'Select...',
                leftIcon: platform.is('ios') ?
                    'radio-button-off' : 'square-outline',
                rightIcon: 'md-arrow-dropdown',
                clickCB: () => { this.onClickSelectButton(); },
                disabledCB: () => { return this.selectButtonDisabled(); }
            },
            {
                text: 'Go home',
                leftIcon: 'home',
                clickCB: () => { this.onClickHomeButton(); },
                disabledCB: () => { return this.atHome(); }
            },
            {
                text: 'Go to parent',
                leftIcon: 'arrow-up',
                rightIcon: 'folder',
                clickCB: () => { this.onClickParentButton(); },
                disabledCB: () => { return this.atHome(); }
            },
            {
                text: 'Add...',
                leftIcon: 'add',
                clickCB: () => { this.onClickAddButton(); }
            }
        ];
        this.footerButtons = [
            {
                text: 'Stats',
                leftIcon: 'information-circle',
                clickCB: () => { this.onClickStatsButton(); }
            },
            {
                text: 'Rename',
                leftIcon: 'md-create',
                clickCB: () => { this.onClickRenameButton(); },
                disabledCB: () => { return this.renameButtonDisabled(); }
            },
            {
                text: 'Move',
                leftIcon: 'share-alt',
                rightIcon: 'folder',
                clickCB: () => { this.onClickMoveButton(); },
                disabledCB: () => { return this.moveButtonDisabled(); }
            },
            {
                text: 'Delete',
                leftIcon: 'trash',
                clickCB: () => { this.onClickDeleteButton(); },
                disabledCB: () => { return this.deleteButtonDisabled(); }
            },
            {
                text: 'Share',
                leftIcon: 'md-share',
                clickCB: () => { this.onClickShareButton(); }
            }
        ];
    }

    /**
     *
     */
    public ionViewDidEnter(): void {
        console.log('ionViewDidEnter()');
        this.appFilesystem.refreshFolder().subscribe(
            () => {
                this.detectChanges();
            },
            (err: any) => {
                throw Error(err);
            }
        );
    }

    /**
     * UI calls this when the 'Select...' button is clicked.
     */
    public onClickSelectButton(): void {
        console.log('onClickSelectButton()');

        const selectAlert: Alert = this.alertController.create();
        selectAlert.setTitle('Select which, in ' +
                             this.appFilesystem.getPath());
        selectAlert.addButton({
            text: 'All',
            handler: () => {
                this.appFilesystem.selectAllOrNone(true);
            }
        });
        selectAlert.addButton({
            text: 'None',
            handler: () => {
                this.appFilesystem.selectAllOrNone(false);
            }
        });

        selectAlert.addButton('Cancel');
        selectAlert.present();

        console.log('after selectAlert.present();');
    }

    /**
     *
     */
    public selectButtonDisabled(): boolean {
        // console.log('selectButtonDisabled()');
        return this.appFilesystem.nEntries() <= 1;
    }

    /**
     * UI calls this when the 'Go home' button is clicked.
     */
    public onClickHomeButton(): void {
        console.log('onClickHomeButton()');
        this.appFilesystem.switchFolder('/').subscribe(
            () => {
                this.detectChanges();
            },
            (err: any) => {
                throw Error(err);
            }
        );
    }

    /**
     * UI calls this when the 'Go home' button is clicked.
     */
    public atHome(): boolean {
        return this.appFilesystem.atHome();
    }

    /**
     * UI calls this when the 'Go to parent' button is clicked.
     */
    public onClickParentButton(): void {
        const path: string = this.appFilesystem.getPath(),
              parentPath: string = folderPathParent(path);
        console.log('onClickParentButton() - path: ' + path +
                    ', parentPath: ' + parentPath);
        this.appFilesystem.switchFolder(parentPath).subscribe(
            () => {
                this.detectChanges();
            },
            (err: any) => {
                throw Error(err);
            }
        );
    }

    /**
     * UI calls this when the 'Add...' button is clicked.
     */
    public onClickAddButton(): void {
        console.log('onClickAddButton()');
        const actionSheet: ActionSheet = this.actionSheetController.create({
            title: 'Create new ... in ' + this.appFilesystem.getPath(),
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
     * UI calls this when the stats button is clicked.
     * Shows cumulative stats on all selected items.
     */
    public onClickStatsButton(): void {
        console.log('onClickStatsButton');
    }

    /**
     * UI calls this when rename button is clicked.
     * Moves selected items into a folder. Prereq: only one entry is
     * selected when we call this function!
     */
    public onClickRenameButton(): void {
        console.log('onClickRenameButton()');
        // only one entry is selected
        const
        afs: AppFilesystem = this.appFilesystem,
        selectedPaths: { [path: string]: number } = afs.selectedPaths,
        fullPath: string = Object.keys(selectedPaths)[0],
        iEntry: number = afs.getOrderIndex(fullPath),
        entry: Entry = afs.entries[iEntry],
        // fullPath = afs.getFullPath(entry),
        entryType: string = (entry.isFile ? 'file' : 'folder');
        console.log('fullpath: ' + fullPath);
        const renameAlert: Alert = this.alertController.create({
            title: 'Rename ' + entryType + ' \'' + entry.name + '\' to:',
            inputs: [{
                name: 'newName',
                placeholder: 'Enter new file name ...'
            }],
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Clicked cancel in rename alert');
                    }
                },
                {
                    text: 'Done',
                    handler: (data: any) => {
                        const newName: string = data.newName;
                        // console.log('HAN: ' + entry);
                        // console.dir(entry);
                        // afs.rename(fullPath, newName).subscribe(
                        afs.rename(fullPath, newName).subscribe(
                            () => {
                                console.log('RENAME DONE!');
                                // does next assignment change it
                                // everywhere?
                                afs.unselectPath(fullPath);
                            },
                            (err: any) => {
                                throw Error(err);
                            }
                        );
                    }
                }
            ]
        });
        renameAlert.present();
    }

    /**
     * UI calls this to determine whether to disable the rename button.
     * @return {boolean}
     */
    public renameButtonDisabled(): boolean {
        return this.appFilesystem.nSelected() !== 1;
    }

    /**
     * UI calls this when move button is clicked.
     * Moves selected items into a folder.
     */
    public onClickMoveButton(): void {
        console.log('onClickMoveButton');
        const modal: Modal = this.modalController.create(MoveToPage);
        modal.present();
        console.log('after modal.present();');
    }

    /**
     * UI calls this to determine whether to disable the move button.
     * @return {boolean}
     */
    public moveButtonDisabled(): boolean {
        // if the only thing selected is the unfiled folder
        // disable delete and move
        if (this.appFilesystem.nSelected() === 1 &&
            this.appFilesystem.isPathSelected('/Unfiled/')) {
            return true;
        }
        return false;
    }

    /**
     *
     */
    private confirmAndDeleteSelected(): void {
        const nSelected: number = this.appFilesystem.nSelected(),
              itemsStr: string = nSelected.toString() + ' item' +
              ((nSelected > 1) ? 's' : ''),
              deleteAlert: Alert = this.alertController.create();

        deleteAlert.setTitle('Are you sure you want to delete ' +
                             itemsStr + '?');

        deleteAlert.addButton('Cancel');

        deleteAlert.addButton({
            text: 'Yes',
            handler: () => {
                this.appFilesystem.deleteSelected().subscribe(
                    () => {
                        this.appFilesystem.switchFolder(
                            this.appFilesystem.getFullPath(
                                this.appFilesystem.folderEntry
                            )).subscribe(
                                () => {
                                    this.detectChanges();
                                },
                                (err1: any) => {
                                    throw Error(err1);
                                }
                            );
                    },
                    (err2: any) => {
                        throw Error(err2);
                    }
                );
            }
        });

        deleteAlert.present();
    }

    /**
     * UI calls this when delete button is clicked.
     */
    public onClickDeleteButton(): void {
        console.log('onClickDeleteButton()');
        if (this.appFilesystem.isPathSelected('/Unfiled/')) {
            const deleteAlert: Alert = this.alertController.create();
            deleteAlert.setTitle('/Unfiled folder cannot be deleted. But it' +
                                 '\'s selected. Automatically unselect it?');
            deleteAlert.addButton('Cancel');
            deleteAlert.addButton({
                text: 'Yes',
                handler: () => {
                    this.appFilesystem.unselectPath('/Unfiled/');
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
     * @return {boolean}
     */
    public deleteButtonDisabled(): boolean {
        // if the only thing selected is the unfiled folder
        // disable delete and move
        if (this.appFilesystem.nSelected() === 1 &&
            this.appFilesystem.isPathSelected('/Unfiled/')) {
            return true;
        }
        return false;
    }

    /**
     * UI calls this when social sharing button is clicked
     */
    public onClickShareButton(): void {
        console.log('onClickShareButton()');
    }

    /**
     * UI calls this when selected badge on top right is clicked
     */
    public onClickSelectedBadge(): void {
        console.log('onClickSelectedBadge()');
        // only go to edit selections if at least one is selected
        // this.navController.push(SelectionPage);
        const modal: Modal = this.modalController.create(SelectionPage);
        modal.present();
        console.log('after modal.present();');
    }

    /**
     *
     */
    private detectChanges(): void {
        console.log('detectChanges()');
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
     */
    public onClickCheckbox(entry: Entry): void {
        console.log('onClickCheckbox()');
        this.appFilesystem.toggleSelectEntry(entry);
        this.detectChanges();
    }

    /**
     * UI calls this when the new folder button is clicked
     */
    public onClickEntry(entry: Entry): void {
        console.log('onClickEntry()');
        if (entry.isDirectory) {
            this.appFilesystem.switchFolder(
                this.appFilesystem.getFullPath(entry)).subscribe(
                    () => {
                        this.detectChanges();
                    },
                    (err: any) => {
                        throw Error(err);
                    }
                );
        }
        else {
            this.navController.push(TrackPage, entry.fullPath);
        }
    }

    /**
     * UI calls this when the new folder button is clicked
     */
    public addFolder(): void {
        const parentPath: string = this.appFilesystem.getPath(),
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
                              console.log('Clicked cancel in add-folder alert');
                          }
                      },
                      {
                          text: 'Done',
                          handler: (data: any) => {
                              let path: string = parentPath + data.folderName;
                              if (!path.length) {
                                  // this code should never be reached
                                  alert('how did we reach this code?');
                                  return;
                              }
                              if (path[path.length - 1] !== '/') {
                                  // last char isn't a slash, add a
                                  // slash at the end
                                  path += '/';
                              }
                              // create the folder
                              this.appFilesystem.createFolder(path).subscribe(
                                  (folderEntry: DirectoryEntry) => {
                                      // re-read parent to load new info
                                      this.appFilesystem.switchFolder(
                                          parentPath
                                      ).subscribe(
                                          () => {
                                              this.detectChanges();
                                          },
                                          (err1: any) => {
                                              throw Error(err1);
                                          }
                                      );
                                  },
                                  (err2: any) => {
                                      throw Error(err2);
                                  }
                              ); // .createFolder().subscribe(
                          } // handler: (data: any) => {
                      }
                  ] // buttons: [
              }); // newFolderAlert: Alert = this.alertController.create({
        newFolderAlert.present();
    }
}
