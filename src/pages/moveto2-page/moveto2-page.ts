// Copyright (c) 2017 Tracktunes Inc

import { Component } from '@angular/core';
import { AppState } from '../../services/app-state/app-state';
import { ButtonbarButton } from '../../components/button-bar/button-bar';
import { SelectionPage } from '../../pages';
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
export class MoveTo2Page extends SelectionPage {
    private headerButtons: ButtonbarButton[];
    /**
     * @constructor
     * @param {AppState}
     * @param {AppFS}
     */
    constructor(
        appState: AppState,
        appFS: AppFS
    ) {
        console.log('MoveTo2Page.constructor()');
        super(appState, appFS);
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
                    // this.onClickHomeButton();
                } // ,
                // disabledCB: atHome
            },
            {
                text: 'Go to parent',
                leftIcon: 'arrow-up',
                rightIcon: 'folder',
                clickCB: () => {
                    // this.onClickParentButton();
                } // ,
                // disabledCB: atHome
            }
        ];

    }

    /**
     * UI calls this when the 'Select...' button is clicked.
     * @returns {void}
     */
    public onClickMoveHereButton(): void {
        console.log('onClickMoveHereButton()');
    }

}
