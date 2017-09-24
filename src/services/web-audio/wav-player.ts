// Copyright (c) 2017 Tracktunes Inc

import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { AUDIO_CONTEXT, WAV_MIME_TYPE } from './common';
import { WAV_CHUNK_LENGTH } from './record-wav';
import { WebAudioPlay } from './play';
import { isOdd, formatTime } from '../../models/utils/utils';
import { MasterClock } from '../master-clock/master-clock';
import { makeWavBlobHeaderView } from '../../models/utils/wav';

const AUDIO_MEMORY_BUFFER_SIZE: number = 128000;

/**
 * Audio Play functions based on WebAudio, originally based on code
 * of Ian McGregor here: http://codepen.io/ianmcgregor/pen/EjdJZZ
 * @class WebAudioPlay
 */
@Injectable()
export class WebAudioWavPlayer extends WebAudioPlayer {
    private oddKeyFileReader: FileReader;
    private evenKeyFileReader: FileReader;

    constructor(masterClock: MasterClock) {
        super(masterClock);
        console.log('constructor():WebAudioPlayWav');
        this.oddKeyFileReader = new FileReader();
        this.evenKeyFileReader = new FileReader();
        // this.onEndeds = {};
    }

    public play(): void {
        // we play from this.pausedAt
    }

    public stop(stopMonitoring: boolean = true): void {
        super.stop(stopMonitoring);
    }

    public togglePlayPause(): void {
        if (!this.isPlaying) {
            console.log('play from: ' + this.pausedAt);
            this.play();
        }
        else {
            this.pause();
            console.log('pause at: ' + this.pausedAt);
        }
    }
}
