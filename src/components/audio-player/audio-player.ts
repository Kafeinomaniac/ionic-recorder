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
import { formatSecondsTime } from '../../models';

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

    // when progress is < 0, we are not moving the progress bar but when
    // we are moving the progress bar it is zero
    private progress: number;

    private changeDetectorRef: ChangeDetectorRef;

    /**
     * @constructor
     */
    constructor(
        player: WavPlayer,
        changeDetectorRef: ChangeDetectorRef
    ) {
        console.log('constructor()');
        this.player = player;
        this.progress = -1;
        this.changeDetectorRef = changeDetectorRef;
    }

    /**
     *
     */
    private detectChanges(): void {
        console.log('detectChanges()');
        setTimeout(
            () => {
                this.changeDetectorRef.detectChanges();
            },
            0
        );
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
        this.progress = progress;
        this.detectChanges();
    }

    public onProgressChangeEnd(progress: number): void {
        console.log('onProgressChangeEnd(): stopping to move at' + progress);
        this.player.jumpTo(progress);
        this.progress = -1;
    }

    /**
     * Handle changes (play new song) when a new song (url) is loaded
     */
    public ngOnChanges(
        changeRecord: { [propertyName: string]: SimpleChange }
    ): void {
        if (changeRecord['filePath'] && this.filePath) {
            console.log('ngOnChanges(): filePath=' + this.filePath);
            this.player.setSourceFile(this.filePath);
        }
    }

    public getDisplayDuration(): string {
        // console.log('getDisplayDuration(): ' + this.displayDuration);
        // return this.displayDuration;
        const duration: number = this.player.getDuration();
        return  formatSecondsTime(duration, duration);
    }

    public getDisplayTime(): string {
        console.log('t: ' + this.progress);
        const duration: number = this.player.getDuration();
        if (this.progress >= 0) {
            return formatSecondsTime(this.progress * duration, duration);
        }
        else {
            return formatSecondsTime(this.player.getTime(), duration);
        }
    }

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

    public ngOnDestroy(): void {
        console.log('ngOnDestroy()');
        this.player.stop();
    }
}
