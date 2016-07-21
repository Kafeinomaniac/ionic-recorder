// Copyright (c) 2016 Tracktunes Inc

import {
    Component
} from '@angular/core';

import {
    formatTime
} from '../../services/utils/utils';

import {
    AudioPlayer
} from '../../directives/audio-player/audio-player';

import {
    RecordingInfo
} from '../../providers/web-audio/common';

import {
    TreeNode
} from '../../services/idb/idb-fs';

import {
    formatLocalTime
} from '../../services/utils/utils';

import {
    MasterClock
} from '../../providers/master-clock/master-clock';

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
    providers: [MasterClock],
    directives: [AudioPlayer]
})
export class TrackPage {
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

    /**
     * TrackPage constructor
     */
    constructor(idbAppFS: IdbAppFS) {
        console.log('constructor():TrackPage');
        idbAppFS.readNode(3).subscribe(
            (node: TreeNode) => {
                if (!node) {
                    console.warn('no node!');
                    return;
                }
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
            }
        );
    }

    /**
     * UI callback handling cancellation of this modal
     * @returns {void}
     */
    public onClickCancel(): void {
        console.log('onClickCancel()');
    }

}
