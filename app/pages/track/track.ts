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
    TreeNode,
    ParentChild
} from '../../services/idb/idb-fs';

import {
    formatLocalTime
} from '../../services/utils/utils';

import {
    getFolderPath
} from '../library/library';

import {
    MasterClock
} from '../../providers/master-clock/master-clock';

const parentChild: ParentChild = {
    parent: {
        name: 'Unfiled',
        parentKey: 1,
        timeStamp: 1468467549736,
        path: '/'
    },
    child: {
        name: '2016-7-13 -- 11:39:04 PM',
        parentKey: 2,
        timeStamp: 1468459742866,
        data: {
            dbStartKey: 1,
            nSamples: 231936,
            sampleRate: 44100,
            startTime: 1468467544459,
            encoding: 'audio/wav'
        }
    }
};

/**
 * @name TrackPage
 * @description
 */
@Component({
    templateUrl: 'build/pages/track/track.html',
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
    constructor() {
        console.log('constructor():TrackPage');
        const child: TreeNode = parentChild.child,
            nSamples: number = child.data.nSamples,
            sampleRate: number = child.data.sampleRate;
        this.fileName = child.name;
        this.folderPath = getFolderPath(parentChild.parent);
        this.dateCreated = formatLocalTime(child.data.startTime);
        this.size = nSamples * 2;
        this.sampleRate = sampleRate;
        this.encoding = child.data.encoding;
        this.nSamples = nSamples;
        this.duration = nSamples / sampleRate;
        this.displayDuration = formatTime(this.duration, this.duration);
        this.recordingInfo = child.data;
    }

    /**
     * UI callback handling cancellation of this modal
     * @returns {void}
     */
    public onClickCancel(): void {
        console.log('onClickCancel()');
    }
}
