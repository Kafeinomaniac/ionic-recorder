// Copyright (c) 2016 Tracktunes Inc

import {Component, Input, OnChanges, SimpleChange} from 'angular2/core';


/**
 * @name AudioPlayer
 * @description
 * An LED lights display. LEDs are displayed either dark (off) or lit up
 * (on), depending on where 'value' is in the interval ['min', 'max'].
 */
@Component({
    selector: 'audio-player',
    templateUrl: 'build/components/audio-player/audio-player.html',
})
export class AudioPlayer implements OnChanges {
    @Input() private title: string;
    @Input() private url: string;
    private playerTime: string;
    private playerDuration: string;

    constructor() {
        console.log('constructor():AudioPlayer');
    }

    ngOnInit() {
    }

    ngOnChanges(changeRecord: { [propertyName: string]: SimpleChange }) {
    }
}
