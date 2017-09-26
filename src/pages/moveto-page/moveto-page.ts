// Copyright (c) 2017 Tracktunes Inc

import {
    Content,
    Modal,
    ModalController,
    ViewController
} from 'ionic-angular';
import {
    ChangeDetectorRef,
    Component,
    ViewChild
} from '@angular/core';
import { ButtonbarButton } from '../../components/button-bar/button-bar';
import { AppFilesystem } from '../../services';
import { SelectionPage } from '../../pages';

/**
 * @class MoveToPage
 * A page for choosing folder to move selected entries into.
 */
@Component({
    selector: 'moveto-page',
    templateUrl: 'moveto-page.html'
})
export class MoveToPage {
    @ViewChild(Content) public content: Content;
    public appFilesystem: AppFilesystem;
    private modalController: ModalController;
    private viewController: ViewController;
    private changeDetectorRef: ChangeDetectorRef;
    private headerButtons: ButtonbarButton[];

    /**
     * @constructor
     * @param {AppFilesystem}
     */
    constructor(
        changeDetectorRef: ChangeDetectorRef,
        appFilesystem: AppFilesystem,
        modalController: ModalController,
        viewController: ViewController
    ) {
        console.log('MoveToPage.constructor()');
        this.changeDetectorRef = changeDetectorRef;
        this.appFilesystem = appFilesystem;
        this.modalController = modalController;
        this.viewController = viewController;

        appFilesystem.whenReady().subscribe(
            () => {
                this.headerButtons = [
                    {
                        text: 'Move here!',
                        leftIcon: 'checkmark',
                        clickCB: () => {
                            this.onClickMoveHereButton();
                        }
                    },
                    {
                        text: 'Go home',
                        leftIcon: 'home',
                        clickCB: () => {
                            this.onClickHomeButton();
                        },
                        disabledCB: () => {
                            return this.appFileSystem.atHome();
                        }
                    },
                    {
                        text: 'Go to parent',
                        leftIcon: 'arrow-up',
                        rightIcon: 'folder',
                        clickCB: () => {
                            this.onClickParentButton();
                        },
                        disabledCB: () => {
                            return this.appFileSystem.atHome();
                        }
                    }
                ];
            }
        );
    }

    /**
     * UI calls this when selected badge on top right is clicked
     */
    public onClickSelectedBadge(): void {
        console.log('onClickSelectedBadge()');
        // only go to edit selections if at least one is selected
        // this.navController.push(SelectionPage);
        let modal: Modal = this.modalController.create(SelectionPage);
        modal.present();
        console.log('after modal.present();');
    }

    public dismiss(data?: any): void {
        // using the injected ViewController this page
        // can "dismiss" itself and pass back data
        this.viewController.dismiss(data);
    }

    /**
     * UI calls this when the 'Select...' button is clicked.
     */
    public onClickMoveHereButton(): void {
        console.log('onClickMoveHereButton()');
        if (this.appFilesystem.isPathSelected('/Unfiled/')) {
            // TODO: do not allow /Unfiled folder to be
            // moved
        }
        // TODO: do not allow moving a parent folder into
        // itself or any of its children

        // TODO: do not allow a child folder to be moved
        // into the parent because it is already there - so
        // do a filter first to get rid of those paths
        // that are already going to be at the same place
        // as a result of the move
        this.appFilesystem.moveSelected().subscribe(
            () => {
                console.log('moved em');
                this.detectChanges();
                this.dismiss();
            },
            (err: any) => {
                alert(err);
            }
        );
    }

    /**
     * UI calls this when the 'Go home' button is clicked.
     */
    public onClickHomeButton(): void {
        console.log('onClickHomeButton()');
        this.appFilesystem.switchDirectory('/').subscribe(
            () => {
                this.detectChanges();
            }
        );
    }

    /**
     * UI calls this when the 'Go to parent' button is clicked.
     */
    public onClickParentButton(): void {
        console.log('onClickParentButton()');
        const path: string = this.appFilesystem.getPath(),
              pathParts: string[] = path.split('/').filter(
                  (str: string) => { return str !== ''; }),
              parentPath: string = '/' +
              pathParts.splice(0, pathParts.length - 1).join('/') + '/';
        this.appFilesystem.switchDirectory(parentPath).subscribe(
            () => {
                this.detectChanges();
            }
        );
    }

    /**
     * UI calls this when the new folder button is clicked
     */
    public onClickEntry(entry: Entry): void {
        console.log('onClickEntry()');
        if (entry.isDirectory) {
            this.appFilesystem.switchDirectory(
                this.appFilesystem.getFullPath(entry)
            ).subscribe(
                () => {
                    this.detectChanges();
                }
            );
        }
    }

    /**
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

}
