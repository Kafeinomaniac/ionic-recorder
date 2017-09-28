// Copyright (c) 2017 Tracktunes Inc

import {
    /* tslint:disable */
    OnChanges,
    SimpleChange,
    /* tslint:enable */
    Component,
    Input
} from '@angular/core';
import { WavPlayer } from '../../services/web-audio/wav-player';

/**
 * An toolbar-like (row on the screen) audio player for controlling
 * blob playback.
 * @class AudioPlay
 */
@Component({
    providers: [WavPlayer],
    selector: 'audio-player',
    templateUrl: 'audio-player.html'
})
export class AudioPlay implements OnChanges {
    @Input() public filePath: string;
    public player: WavPlayer;

    /**
     * @constructor
     */
    constructor(player: WavPlayer) {
        console.log('AudioPlayer.constructor()');
        this.player = player;
    }

    /**
     * Handle changes (play new song) when a new song (url) is loaded
     */
    public ngOnChanges(
        changeRecord: { [propertyName: string]: SimpleChange }
    ): void {
        if (changeRecord['filePath'] && this.filePath) {
            console.log('AudioPlayer.ngOnChanges(): [filePath]: ' +
                        this.filePath);
            this.player.setSourceFile(this.filePath);
        }
    }

    public ngOnInit(): void {
        console.log('AudioPlayer.ngOnInit()');
        // TODO: this maintains monitoring throughout app, you
        // can do this better by stopping to monitor when going to
        // another page but then there will need to be communication
        // between the track page and this directive to tell the
        // directive to start/stop monitoring. We can start monitoring
        // upon player.relativeTimeSeek() and stop monitoring upon
        // player.pause() or player.stop() - but right now that does
        // not work due to race conditions (perhaps add a setTimeout()
        // to delay the stop monitoring command?)
        this.player.startMonitoring();


        // NB: this next line is what starts player playing right away
        // this.player.togglePlayPause();
    }

    public ngOnDestroy(): void {
        console.log('AudioPlayer.ngOnDestroy()');
        this.player.stop(true);
        this.player.stopMonitoring();
    }
}
