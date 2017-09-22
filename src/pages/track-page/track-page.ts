// Copyright (c) 2017 Tracktunes Inc

import { Observable } from 'rxjs/Rx';
import { ActionSheetController, NavParams, Content } from 'ionic-angular';
import { ButtonbarButton } from '../../components/button-bar/button-bar';
import { Component, ViewChild } from '@angular/core';
import { RecordingInfo } from '../../services/web-audio/common';
import { WebAudioSaveWav } from '../../services/web-audio/save-wav';

/**
 * @class TrackPage
 */
@Component({
    selector: 'track-page',
    providers: [WebAudioSaveWav],
    templateUrl: 'track-page.html'
})
export class TrackPage {
    @ViewChild(Content) public content: Content;
    private webAudioSaveWav: WebAudioSaveWav;
    private actionSheetController: ActionSheetController;
    public footerButtons: ButtonbarButton[];
    public recordingInfo: RecordingInfo;

    /**
     * @constructor
     * @param {WebAudioSaveWav}
     * @param {NavParams}
     * @param {ActionSheetController}
     */
    constructor(
        webAudioSaveWav: WebAudioSaveWav,
        navParams: NavParams,
        actionSheetController: ActionSheetController
    ) {
        console.log('constructor():TrackPage');

        this.webAudioSaveWav = webAudioSaveWav;
        this.actionSheetController = actionSheetController;

        const key: number = navParams.data;

        this.footerButtons = [
            {
                text: 'Move',
                leftIcon: 'share-alt',
                rightIcon: 'folder',
                clickCB: () => {
                    this.onClickMoveButton();
                }
            },
            {
                text: 'Delete',
                leftIcon: 'trash',
                clickCB: () => {
                    this.onClickDeleteButton();
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
                        console.log('Share as local file clicked, fname: ' +
                            this.recordingInfo.fileName + '.wav');
                        // console.dir(this.recordingInfo);
                        // ***TODO*** no longer have recording info?
                        // this.webAudioSaveWav.save(
                        //     this.recordingInfo, this.fileName + '.wav');
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

    private resize(): void {
        setTimeout(
            () => {
                this.content.resize();
            },
            20);
    }

    /**
     * UI callback handling 'share' button click
     */
    public onClickShareButton(): void {
        console.log('onClickShareButton()');
        this.presentActionSheet();
    }

}
