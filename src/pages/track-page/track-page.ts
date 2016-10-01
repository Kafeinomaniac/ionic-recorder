// Copyright (c) 2016 Tracktunes Inc

import {
    Component
} from '@angular/core';

import {
    NavParams
} from 'ionic-angular';

import {
    formatTime
} from '../../services/utils/utils';

import {
    ButtonbarButton
} from '../../directives/button-bar/button-bar';

import {
    RecordingInfo
} from '../../providers/web-audio/common';

import {
    WebAudioPlayerWav
} from '../../providers/web-audio/player-wav';

import {
    formatLocalTime
} from '../../services/utils/utils';

// this is here just for testing
import {
    IdbAppFS
} from '../../providers/idb-app-fs/idb-app-fs';

/**
 * @name TrackPage
 * @description
 */
@Component({
    providers: [WebAudioPlayerWav],
    templateUrl: 'track-page.html'
})
export class TrackPage {
    // used in template
    public fileName: string;
    public folderPath: string;
    public dateCreated: string;
    public recordingInfo: RecordingInfo;
    public displayDuration: string;
    
    private duration: number;
    public headerButtons: ButtonbarButton[];

    /**
     * TrackPage constructor
     */
    constructor(
        navParams: NavParams,
        idbAppFS: IdbAppFS
    ) {
        console.log('constructor():TrackPage');

        console.dir(navParams.data);

        const navData: any = navParams.data;

        this.fileName = navData.fileName;
        // this.folderPath = '/Unfiled';
        this.folderPath = navData.folderPath;
        this.recordingInfo = navData.recordingInfo;
        // this.encoding = node.data.encoding;
        // this.nSamples = node.data.nSamples;
        // this.sampleRate = node.data.sampleRate;
        this.dateCreated = formatLocalTime(this.recordingInfo.dateCreated);
        // this.size = node.data.size;
        this.duration =
            this.recordingInfo.nSamples / this.recordingInfo.sampleRate;
        this.displayDuration = formatTime(this.duration, this.duration);

        this.headerButtons = [
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
     * UI callback handling cancellation of this modal
     * @returns {void}
     */
    public onClickMoveButton(): void {
        console.log('onClickMoveButton()');
    }
    /**
     * UI callback handling cancellation of this modal
     * @returns {void}
     */
    public onClickDeleteButton(): void {
        console.log('onClickDeleteButton()');
    }
    /**
     * UI callback handling cancellation of this modal
     * @returns {void}
     */
    public onClickShareButton(): void {
        console.log('onClickShareButton()');
    }

}
