// Copyright (c) 2016 Tracktunes Inc

import {
    Component,
    Input,
    OnChanges,
    SimpleChange
} from '@angular/core';

import {
    IONIC_DIRECTIVES
} from 'ionic-angular';

import {
    WebAudioPlayer
} from '../../providers/web-audio/web-audio-player';

/**
 * @name AudioPlayer
 * @description
 * An toolbar-like (row on the screen) audio player for controlling
 * blob playback.
 */
@Component({
    selector: 'audio-player',
    templateUrl: 'build/components/audio-player/audio-player.html',
    providers: [WebAudioPlayer],
    directives: [IONIC_DIRECTIVES]
})
export class AudioPlayer implements OnChanges {
    @Input() private title: string;
    @Input() private blob: Blob;
    private player: WebAudioPlayer;
    private hidden: boolean;

    /**
     * @constructor
     */
    constructor(player: WebAudioPlayer) {
        console.log('constructor():AudioPlayer');
        this.player = player;
        // player starts at hidden state
        this.hidden = true;
    }

    /**
     * Show audio player
     * @returns {void}
     */
    public show(): void {
        this.hidden = false;
    }

    /**
     * Hide audio player
     * @returns {void}
     */
    public hide(): void {
        this.hidden = true;
    }

    public onPositionChange(position: number) {
        console.log('onPositionChange(' + position + ')');
    }

    /**
     * Handle changes (play new song) when a new song (url) is loaded
     * @returns {void}
     */
    public ngOnChanges(
        changeRecord: { [propertyName: string]: SimpleChange }
    ): void {
        if (changeRecord['title']) {
            console.log('AudioPlayer:ngOnChanges(): title: ' + this.title);
            if (this.title !== undefined) {
                this.show();
            }
        }
        if (changeRecord['blob']) {
            console.log('AudioPlayer:ngOnChanges(): blob: ' + this.blob);
            if (this.blob !== undefined) {
                this.player.loadAndDecode(
                    this.blob,
                    true,
                    () => {
                        alert('FileReader error: could not load blob');
                    },
                    () => {
                        alert([
                            'Your browser had recorded the audio file you are ',
                            'playing and then it saved it to a local file on ',
                            'your device, but it now reports that it cannot ',
                            'play that audio file  We expect this problem to ',
                            'be fixed soon as more audio file formats get ',
                            'handled by modern browsers but we are looking ',
                            'for alternative playback solutions. In the ',
                            'meantime, you can share the fles you want to ',
                            'play to your device and play them with any ',
                            'music player on your device.   '
                        ].join(''));
                    });
            }
        }
    }
}
