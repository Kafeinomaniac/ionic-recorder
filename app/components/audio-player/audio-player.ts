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
    private playPauseButtonIcon: string = 'play';

    constructor() {
        console.log('constructor():AudioPlayer');
    }

    ngOnInit() {
    }

    show() {
        this.hidden = false;
    }

    hide() {
        this.hidden = true;
    }

    play() {
        console.log('AudioPlayer:play()');
        this.playPauseButtonIcon = 'pause';
    }

    pause() {
        console.log('AudioPlayer:pause()');
        this.playPauseButtonIcon = 'play';
        // this.sourceNode.disconnect();
    }
    
    resume() {
        console.log('AudioPlayer:resume()');
        // this.sourceNode.connect(destination)
    }
    
    stop() {
        console.log('AudioPlayer:stop()');
        this.playPauseButtonIcon = 'play';
    }

    onClickPlayPauseButton() {
        console.log('onClickPlayPauseButton()');

        if (this.playPauseButtonIcon === 'play') {
            this.playPauseButtonIcon = 'pause';
        }
        else {
            this.playPauseButtonIcon = 'play';
        }
    }

    onClickCloseButton() {
        this.stop();
        this.hide();
    }

    ngOnChanges(changeRecord: { [propertyName: string]: SimpleChange }) {
        console.log('AudioPlayer:ngOnChanges() title: ' + this.title);
        if (changeRecord['title']) {
            if (!changeRecord['url']) {
                console.error('title but no url');
                alert('title but no url');
                throw Error('title but no url');
            }
            if (this.title !== undefined) {
                this.show();
            }
        }
        if (changeRecord['url']) {
            if (!changeRecord['title']) {
                console.error('url but no title');
                alert('url but no title');
                throw Error('url but no title');
            }            
        }
    }
}
