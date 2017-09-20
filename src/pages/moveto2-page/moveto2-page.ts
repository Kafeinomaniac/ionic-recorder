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
import { AppFS } from '../../services';
import { SelectionPage } from '../../pages';

/**
 * @class MoveTo2Page
 * A page for choosing folder to move selected entries into.
 */
@Component({
    selector: 'moveto2-page',
    templateUrl: 'moveto2-page.html'
})
export class MoveTo2Page {
    @ViewChild(Content) public content: Content;
    public appFS: AppFS;
    private modalController: ModalController;
    private viewController: ViewController;
    private changeDetectorRef: ChangeDetectorRef;
    private headerButtons: ButtonbarButton[];

    /**
     * @constructor
     * @param {AppFS}
     */
    constructor(
        changeDetectorRef: ChangeDetectorRef,
        appFS: AppFS,
        modalController: ModalController,
        viewController: ViewController
    ) {
        console.log('MoveTo2Page.constructor()');
        this.changeDetectorRef = changeDetectorRef;
        this.appFS = appFS;
        this.modalController = modalController;
        this.viewController = viewController;

        appFS.whenReady().subscribe(
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
                            return this.appFS.directoryEntry.fullPath === '/';
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
                            return this.appFS.directoryEntry.fullPath === '/';
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
        if (this.appFS.isPathSelected('/Unfiled/')) {
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
        this.appFS.moveSelected().subscribe(
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
        this.appFS.switchDirectory('/').subscribe(
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
     * UI calls this when the new folder button is clicked
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
