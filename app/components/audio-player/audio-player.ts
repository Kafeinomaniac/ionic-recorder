// Copyright (c) 2016 Tracktunes Inc

import {Component, Input, OnChanges, SimpleChange} from 'angular2/core';
import {IONIC_DIRECTIVES} from 'ionic-angular';


/**
 * @name AudioPlayer
 * @description
 * An LED lights display. LEDs are displayed either dark (off) or lit up
 * (on), depending on where 'value' is in the interval ['min', 'max'].
 */
@Component({
    selector: 'audio-player',
    templateUrl: 'build/components/audio-player/audio-player.html',
    directives: [IONIC_DIRECTIVES]
})
export class AudioPlayer implements OnChanges {
    @Input() private title: string = '';
    @Input() private url: string = '';
    private time: string = '0:00';
    private duration: string = '0:00';
    private hidden: boolean = true;

    constructor() {
        console.log('constructor():AudioPlayer');
    }

    ngOnInit() {
    }

    onClickPlayPauseButton() {

    }

    show() {
        this.hidden = false;
    }

    hide() {
        this.hidden = true;
    }

    onClickCloseButton() {
        // TODO: stop the playing
        this.hide();
    }

    ngOnChanges(changeRecord: { [propertyName: string]: SimpleChange }) {
        console.log('AudioPlayer:ngOnChanges() title: ' + this.title);
        if (changeRecord['title']) {
            if (this.title !== undefined) {
                this.show();
            }
        }
    }
}
