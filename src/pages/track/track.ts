// Copyright (c) 2017 Tracktunes Inc

import { ActionSheetController, NavParams } from 'ionic-angular';
import { ButtonbarButton } from '../../components/button-bar/button-bar';
import { Component } from '@angular/core';
import {
    DB_KEY_PATH,
    KeyDict,
    ParentChild,
    ROOT_FOLDER_KEY,
    TreeNode
} from '../../models/idb/idb-fs';
import { formatLocalTime } from '../../models/utils/utils';
import { formatTime } from '../../models/utils/utils';
import { getFolderPath } from '../library/library';
import { IdbAppFS } from '../../services/idb-app-fs/idb-app-fs';
import { RecordingInfo } from '../../services/web-audio/common';
import { WebAudioSaveWav } from '../../services/web-audio/save-wav';

/**
 * @name TrackPage
 * @description
 */
@Component({
    selector: 'track',
    providers: [WebAudioSaveWav],
    templateUrl: 'track.html'
})
export class TrackPage {
    private webAudioSaveWav: WebAudioSaveWav;
    private actionSheetController: ActionSheetController;
    // used in template
    public fileName: string;
    public folderPath: string;
    public dateCreated: string;
    public recordingInfo: RecordingInfo;
    public displayDuration: string;
    public footerButtons: ButtonbarButton[];
    private duration: number;

    /**
     * @constructor
     * @param {WebAudioSaveWav}
     * @param {IdbAppFS}
     * @param {NavParams}
     * @param {ActionSheetController}
     */
    constructor(
        webAudioSaveWav: WebAudioSaveWav,
        idbAppFS: IdbAppFS,
        navParams: NavParams,
        actionSheetController: ActionSheetController
    ) {
        console.log('constructor():TrackPage');

        this.actionSheetController = actionSheetController;
        const key: number = navParams.data;
        idbAppFS.readNode(key).subscribe(
            (node: TreeNode) => {
                this.fileName = node.name;
                this.recordingInfo = node.data;
                this.duration = this.recordingInfo.nSamples / 
                    this.recordingInfo.sampleRate;
                this.displayDuration =
                    formatTime(this.duration, this.duration);
                this.dateCreated =
                    formatLocalTime(this.recordingInfo.dateCreated)
                const parentKey: number = node.parentKey;
                idbAppFS.readNode(parentKey).subscribe(
                    (parentNode: TreeNode) => {
                        this.folderPath = getFolderPath(parentNode);
                    },
                    (err1: any) => {
                        throw new Error(err1);
                    }
                );
            },
            (err2: any) => {
                throw new Error(err2);
            }
        );

        this.webAudioSaveWav = webAudioSaveWav;

        // this.fileName = navData.fileName;
        // this.folderPath = navData.folderPath;
        // this.recordingInfo = navData.recordingInfo;
        // this.dateCreated = formatLocalTime(this.recordingInfo.dateCreated);

        this.footerButtons = [{
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
     * @returns {void}
     */
    public onClickMoveButton(): void {
        console.log('onClickMoveButton()');
    }
    /**
     * UI callback handling 'delete' button click
     * @returns {void}
     */
    public onClickDeleteButton(): void {
        console.log('onClickDeleteButton()');
    }

    /**
     * UI callback handling 'share' button click
     * @returns {void}
     */
    private presentActionSheet(): void {
        this.actionSheetController.create({
            title: 'Share as',
            buttons: [{
                text: 'Local file on device',
                handler: () => {
                    console.log('Share as local file clicked, fname: ' +
                        this.fileName + '.wav');
                    // console.dir(this.recordingInfo);
                    this.webAudioSaveWav.save(
                        this.recordingInfo, this.fileName + '.wav');
                }
            }, {
                text: 'Cancel',
                role: 'cancel',
                handler: () => {
                    console.log('Cancel clicked');
                }
            }]
        }).present();
    }

    /**
     * UI callback handling 'share' button click
     * @returns {void}
     */
    public onClickShareButton(): void {
        console.log('onClickShareButton()');
        this.presentActionSheet();
    }

}
