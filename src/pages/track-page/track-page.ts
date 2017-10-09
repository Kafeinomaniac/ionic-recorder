// Copyright (c) 2017 Tracktunes Inc

import { ActionSheetController, NavParams } from 'ionic-angular';
import { ButtonbarButton } from '../../components/button-bar/button-bar';
import { Component } from '@angular/core';

/**
 * @class TrackPage
 */
@Component({
    selector: 'track-page',
    templateUrl: 'track-page.html'
})
export class TrackPage {
    private actionSheetController: ActionSheetController;
    public footerButtons: ButtonbarButton[];
    public filePath: string;

    /**
     * @constructor
     * @param {NavParams}
     * @param {ActionSheetController}
     */
    constructor(
        navParams: NavParams,
        actionSheetController: ActionSheetController
    ) {
        console.log('TrackPage:constructor(' + navParams.data + ')');

        this.actionSheetController = actionSheetController;

        this.filePath = navParams.data;

        this.footerButtons = [
            {
                text: 'Rename',
                leftIcon: 'create',
                clickCB: () => { this.onClickRenameButton(); }
            },
            {
                text: 'Move',
                leftIcon: 'share-alt',
                rightIcon: 'folder',
                clickCB: () => { this.onClickMoveButton(); }
            },
            {
                text: 'Delete',
                leftIcon: 'trash',
                clickCB: () => { this.onClickDeleteButton(); }
            },
            {
                text: 'Share',
                leftIcon: 'md-share',
                clickCB: () => { this.onClickShareButton(); }
            }
        ];
    }

    /**
     * UI callback handling 'rename' button click
     */
    public onClickStatsButton(): void {
        console.log('onClickStatsButton()');
    }

    /**
     * UI callback handling 'rename' button click
     */
    public onClickRenameButton(): void {
        console.log('onClickRenameButton()');
    }

    /**
     * UI callback handling 'move' button click
     */
    public onClickMoveButton(): void {
        console.log('onClickMoveButton()');
    }

    /**
     * UI callback handling 'delete' button click
     */
    public onClickDeleteButton(): void {
        console.log('onClickDeleteButton()');
    }

    /**
     * UI callback handling 'share' button click
     */
    private presentActionSheet(): void {
        this.actionSheetController.create({
            title: 'Share as',
            buttons: [
                {
                    text: 'Local file on device',
                    handler: () => {
                        console.log('Share as local file clicked, fname: ');
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                }
            ]
        }).present();
    }

    /**
     * UI callback handling 'share' button click
     */
    public onClickShareButton(): void {
        console.log('onClickShareButton()');
        this.presentActionSheet();
    }

}
