// Copyright (c) 2017 Tracktunes Inc

import {
    /* tslint:disable */
    ChangeDetectorRef,
    OnChanges,
    SimpleChange,
    /* tslint:enable */
    Component,
    Input
} from '@angular/core';
import { WavPlayer } from '../../services/web-audio/wav-player';
import { formatTime, pathFilename } from '../../models';

/**
 * An toolbar-like (row on the screen) audio player for controlling
 * blob playback.
 * @class AudioPlayer
 */
@Component({
    providers: [ WavPlayer ],
    selector: 'audio-player',
    templateUrl: 'audio-player.html'
})
export class AudioPlayer implements OnChanges {
    @Input() public filePath: string;
    public player: WavPlayer;

    private changeDetectorRef: ChangeDetectorRef;
    private filenameOrProgress: string;
    public progress: number;

    /**
     * @constructor
     */
    constructor(
        player: WavPlayer,
        changeDetectorRef: ChangeDetectorRef
    ) {
        console.log('AudioPlayer:constructor()');
        this.changeDetectorRef = changeDetectorRef;
        this.player = player;
        this.filenameOrProgress = '';
        this.progress = -1;
    }

    /**
     * Return the Ionicons icon name for visualizing current play status.
     * @return {string} - the Ionicons icon name to show current play status
     */
    public getPlayerStatusIcon(): string {
        // console.log('statusIcon(): ' + (this.isPlaying ? "pause" : "play"));
        return this.player.isPlaying ? 'pause' : 'play';
    }

    /**
     * This function is a way to drive a time change in the player from
     * the outside.  This is essentially a skip().
     * Called every time the progress is moving via a touch gesture on a
     * mobile phone or the mouse on a laptop / desktop. This is called during
     * the move when the change event of ProgressSlider is emmited. At the end
     * of each sequence of such events there will be one changeEnd event.
     */
    public onProgressChange(progress: number): void {
        console.log('onProgressChange(' + progress.toFixed(2) + ')');
        this.progress = progress;
        this.filenameOrProgress = formatTime(
            progress * this.player.duration,
            this.player.duration
        );
        this.detectChanges();
    }

    /**
     * Handle the one event that happens when you're done with manual sliding
     * around of the progress bar.
     */
    public onProgressChangeEnd(progress: number): void {
        console.log('onProgressChangeEnd(): At ' + progress.toFixed(2));
        // if (this.player.isPlaying) {
        //     this.player.jumpToPosition(progress);
        // }
        this.filenameOrProgress = pathFilename(this.filePath);

        // TODO: check if next line (this.progress = -1;) is necessary.
        // restore this.progress to being negative so as to tell this player
        // that we are now no longer moving the progress slider manually but
        // are driving it via the player class
        this.progress = -1;
        this.player.jumpToPosition(progress);

        this.detectChanges();
    }

    /**
     * Handle changes (play new song) when a new song (url) is loaded
     */
    public ngOnChanges(
        changeRecord: { [propertyName: string]: SimpleChange }
    ): void {
        if (changeRecord['filePath'] && this.filePath) {
            console.log('ngOnChanges(): filePath=' + this.filePath);
            this.filenameOrProgress = pathFilename(this.filePath);
            this.player.setSourceFile(this.filePath);
        }
    }

    /**
     *
     */

    public getProgress(): number {
        console.log('getProgress()');
        if (this.progress === -1) {
            // NOTE: uncomment console.logs here to spy on jumps in the
            // position of the handle. They are what helped fix it.
            // console.log('getProgress() => ' + this.player.progress);
            return this.player.progress;
        }
        else {
            // console.log('getProgress() => ' + this.progress);
            return this.progress;
        }
    }

    /**
     *
     */
    // public getDisplayDuration(): string {
    //     // console.log('getDisplayDuration(): ' + this.displayDuration);
    //     // return this.displayDuration;
    //     const duration: number = this.player.duration;
    //     return  formatTime(duration, duration);
    // }

    /**
     *
     */
    /*
    public getDisplayTime(): string {
        console.log('t: ' + this.progress.toFixed(2));
        const duration: number = this.player.duration;
        if (this.progress >= 0) {
            return formatTime(this.progress * duration, duration);
        }
        else {
            return formatTime(this.player.getTime(), duration);
        }
    }
    */
    /**
     *
     */
    public ngOnInit(): void {
        console.log('ngOnInit()');
        // TODO: this maintains monitoring throughout app, you
        // can do this better by stopping to monitor when going to
        // another page but then there will need to be communication
        // between the track page and this directive to tell the
        // directive to start/stop monitoring. We can start monitoring
        // upon player.relativeTimeSeek() and stop monitoring upon
        // player.pause() or player.stop() - but right now that does
        // not work due to race conditions (perhaps add a setTimeout()
        // to delay the stop monitoring command?)
        // this.player.startMonitoring();

        // NB: this next line is what starts player playing right away
        // this.player.togglePlayPause();
    }

    /**
     *
     */
    public ngOnDestroy(): void {
        console.log('ngOnDestroy()');
        this.player.stop();
    }

    /**
     *
     */
    private detectChanges(): void {
        // console.log('detectChanges()');
        setTimeout(
            () => {
                this.changeDetectorRef.detectChanges();
            },
            0
        );
    }

}
