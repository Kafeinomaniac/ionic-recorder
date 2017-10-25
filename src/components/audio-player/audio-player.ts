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

const PROGRESS_BY_PLAYER: number = -1;

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
        console.log('constructor()');
        this.changeDetectorRef = changeDetectorRef;
        this.player = player;
        this.filenameOrProgress = '';
        this.progress = PROGRESS_BY_PLAYER;
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
        // console.log('onProgressChange(' + progress.toFixed(2) + ')');
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

        // TODO: check if next line (this.progress =
        // PROGRESS_BY_PLAYER) is necessary.  Restore this.progress
        // to being negative so as to tell this player that we are now
        // no longer moving the progress slider manually but are
        // driving it via the player class
        this.progress = PROGRESS_BY_PLAYER;
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
            this.player.setSourceFile(this.filePath, true);
        }
    }

    /**
     * Used by template to display progress position in the
     * progress-slider directive. It reflects user mouse or touch
     * gesture of the progress slider handle if it is being moved by
     * the user or, if the player is playing audio, the current audio
     * playback position.
     * @return {number} A float in [0, 1] that reflects the current
     * play position / current progress slider handle position.
     */
    public getProgress(): number {
        if (this.progress === PROGRESS_BY_PLAYER) {
            // NOTE: uncomment console.logs here to spy on jumps in the
            // position of the handle. They are what helped fix it.
            // console.log('getProgress() => ' + this.player.progress);
            // console.log('getProgress() -P-> ' + this.player.progress);
            return this.player.progress;
        }
        else {
            // progress by mouse or touch gesture
            // console.log('getProgress() => ' + this.progress);
            // console.log('getProgress() -M-> ' + this.progress);
            return this.progress;
        }
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
