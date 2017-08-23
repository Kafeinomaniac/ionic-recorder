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
} from '../../models/idb/idb-fs';
import { formatLocalTime } from '../../models/utils/utils';
import { formatTime } from '../../models/utils/utils';
import { getFolderPath } from '../library/library';
import { IdbAppFS } from '../../services/idb-app-fs/idb-app-fs';
import { RecordingInfo } from '../../services/web-audio/common';
import { WebAudioSaveWav } from '../../services/web-audio/save-wav';

export interface TrackInfo {
    fileName: string;
    folderPath: string;
    dateCreated: string;
    duration: number;
    displayDuration: string;
    encoding: string;
    fileSize: number;
    sampleRate: number;
    nSamples: number;
}

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
    public footerButtons: ButtonbarButton[];
    public trackInfo: TrackInfo;
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
            (trackInfo: TrackInfo) => {
                this.trackInfo = trackInfo;
            }
        );

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
     * @returns {Observable<TrackInfo>}
     */
    public getTrackInfo(
        key: number, 
        getPath: boolean = false
    ): Observable<TrackInfo> {
        let source: Observable<TrackInfo> = Observable.create((observer) => {
            this.idbAppFS.readNode(key).subscribe(
                (node: TreeNode) => {
                    const recInfo: RecordingInfo = node.data,
                          duration = recInfo.nSamples / recInfo.sampleRate,
                          parentKey = node.parentKey;
                    let trackInfo: TrackInfo = {
                        fileName: node.name,
                        duration: duration,
                        displayDuration: formatTime(duration, duration),
                        dateCreated: formatLocalTime(recInfo.dateCreated),
                        encoding: recInfo.encoding,
                        fileSize: recInfo.size+44,
                        sampleRate: recInfo.sampleRate,
                        nSamples: recInfo.nSamples,
                        folderPath: null
                    };
                    if (getPath) {
                        this.idbAppFS.readNode(parentKey).subscribe(
                            (parentNode: TreeNode) => {
                                trackInfo.folderPath = 
                                    getFolderPath(parentNode);
                                observer.next(trackInfo);
                                observer.complete();
                            },
                            (err1: any) => {
                                observer.error(err1);
                            }
                        );
                    }
                    else {
                        observer.next(trackInfo);
                        observer.complete();
                    }
                },
                (err2: any) => {
                    observer.error(err2);
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
            buttons: [
                {
                    text: 'Local file on device',
                    handler: () => {
                        console.log('Share as local file clicked, fname: ' +
                                    this.trackInfo.fileName + '.wav');
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
