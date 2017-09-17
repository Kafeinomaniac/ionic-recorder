// Copyright (c) 2017 Tracktunes Inc

import {
    Content
} from 'ionic-angular';
import {
    ChangeDetectorRef,
    Component,
    ViewChild
} from '@angular/core';
import { ButtonbarButton } from '../../components/button-bar/button-bar';
import { AppFS } from '../../services';

/**
 * @name MoveTo2Page
 * @description
 * Page of file/folder interface to all recorded files. AddFolderPage
 * music organizer.
 */
@Component({
    selector: 'moveto2-page',
    templateUrl: 'moveto2-page.html'
})
export class MoveTo2Page {
    @ViewChild(Content) public content: Content;
    public appFS: AppFS;
    private changeDetectorRef: ChangeDetectorRef;
    private headerButtons: ButtonbarButton[];

    /**
     * @constructor
     * @param {AppFS}
     */
    constructor(
        changeDetectorRef: ChangeDetectorRef,
        appFS: AppFS
    ) {
        console.log('MoveTo2Page.constructor()');
        this.changeDetectorRef = changeDetectorRef;
        this.appFS = appFS;

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
     * UI calls this when the 'Select...' button is clicked.
     */
    public onClickMoveHereButton(): void {
        console.log('onClickMoveHereButton()');
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
