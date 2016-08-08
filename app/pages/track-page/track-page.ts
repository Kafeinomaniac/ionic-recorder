// Copyright (c) 2016 Tracktunes Inc

import {
    Component
} from '@angular/core';

import {
    NavParams
    // NavController
} from 'ionic-angular';

import {
    formatTime
} from '../../services/utils/utils';

import {
    AudioPlayer
} from '../../directives/audio-player/audio-player';

import {
    ButtonToolbar,
    ToolbarButton
} from '../../directives/button-toolbar/button-toolbar';

import {
    RecordingInfo
} from '../../providers/web-audio/common';

import {
    TreeNode
} from '../../services/idb/idb-fs';

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
    templateUrl: 'build/pages/track-page/track-page.html',
    directives: [AudioPlayer, ButtonToolbar]
})
export class TrackPage {
    private navParams: NavParams;
    // private navController: NavController;
    private fileName: string;
    private folderPath: string;
    private dateCreated: string;
    private size: number;
    private sampleRate: number;
    private encoding: string;
    private nSamples: number;
    private duration: number;
    private displayDuration: string;
    private recordingInfo: RecordingInfo;
    private headerButtons: ToolbarButton[];

    /**
     * TrackPage constructor
     */
    constructor(
        navParams: NavParams,
        // navController: NavController,
        idbAppFS: IdbAppFS
    ) {
        console.log('constructor():TrackPage');

        console.dir(navParams.data);

        const node: TreeNode = navParams.data;

        this.fileName = node.name;
        this.folderPath = '/Unfiled';
        this.encoding = node.data.encoding;
        this.nSamples = node.data.nSamples;
        this.sampleRate = node.data.sampleRate;
        this.dateCreated = formatLocalTime(node.data.startTime);
        this.size = 2 * this.nSamples;
        this.duration = this.nSamples / this.sampleRate;
        this.displayDuration = formatTime(this.duration, this.duration);
        this.recordingInfo = node.data;

        this.headerButtons = [
            {
                text: 'Share',
                leftIcon: 'md-share',
                clickCB: () => {
                    this.onClickShareButton();
                }
            },
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
            }
            // ,
            // {
            //     text: 'To parent',
            //     leftIcon: 'arrow-up',
            //     rightIcon: 'folder',
            //     clickCB: () => {
            //         this.onClickParentButton();
            //     }
            // }
        ];
    }

    /**
     * UI calls this when the goToParent button is clicked
     * @returns {void}
     */
    // public onClickParentButton(): void {
    //     console.log('onClickParentButton()');
    //     this.navController.pop();
    // }

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
