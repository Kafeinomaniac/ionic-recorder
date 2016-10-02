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
    public headerButtons: ButtonbarButton[];
    private duration: number;

    /**
     * TrackPage constructor
     */
    constructor(
        navParams: NavParams
    ) {
        console.log('constructor():TrackPage');

        const navData: any = navParams.data;

        this.fileName = navData.fileName;
        this.folderPath = navData.folderPath;
        this.recordingInfo = navData.recordingInfo;
        this.dateCreated = formatLocalTime(this.recordingInfo.dateCreated);

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
    public onClickShareButton(): void {
        console.log('onClickShareButton()');
    }

}
