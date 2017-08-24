// Copyright (c) 2017 Tracktunes Inc

import { Observable } from 'rxjs/Rx';
import { ActionSheetController, NavParams } from 'ionic-angular';
import { ButtonbarButton } from '../../components/button-bar/button-bar';
import { Component } from '@angular/core';
import {
    DB_KEY_PATH,
    KeyDict,
    ParentChild,
    ROOT_FOLDER_KEY,
    TreeNode
}
from '../../models/idb/idb-fs';
import { formatLocalTime } from '../../models/utils/utils';
import { formatTime } from '../../models/utils/utils';
import { IdbAppFS } from '../../services/idb-app-fs/idb-app-fs';
import { RecordingInfo } from '../../services/web-audio/common';
import { WebAudioSaveWav } from '../../services/web-audio/save-wav';

/**
 * @name TrackPage
 * @description
 */
@Component({
    selector: 'track-page',
    providers: [WebAudioSaveWav],
    templateUrl: 'track-page.html'
})
export class TrackPage {
    private webAudioSaveWav: WebAudioSaveWav;
    private actionSheetController: ActionSheetController;
    public footerButtons: ButtonbarButton[];
    public recordingInfo: RecordingInfo;
    private idbAppFS: IdbAppFS;

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

        this.webAudioSaveWav = webAudioSaveWav;
        this.idbAppFS = idbAppFS;
        this.actionSheetController = actionSheetController;

        const key: number = navParams.data;

        this.getTrackInfo(key, true).subscribe(
            (trackInfo: RecordingInfo) => {
                this.recordingInfo = trackInfo;
            }
        );

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
     * @returns {Observable<TrackInfo>}
     */
    public getTrackInfo(
        key: number,
        getPath: boolean = false
    ): Observable<RecordingInfo> {
        let source: Observable<RecordingInfo> = Observable.create((observer) => {
            this.idbAppFS.readNode(key).subscribe(
                (node: TreeNode) => {
                    observer.next(node.data);
                    observer.complete();
                },
                (err: any) => {
                    observer.error(err);
                }
            );
        });
        return source;
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

    /**
     * UI callback handling 'share' button click
     * @returns {void}
     */
    public onClickShareButton(): void {
        console.log('onClickShareButton()');
        this.presentActionSheet();
    }

}
