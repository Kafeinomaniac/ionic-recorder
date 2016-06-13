// Copyright (c) 2016 Tracktunes Inc

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { formatTime } from '../utils/format-time';

// sets the frame-rate at which either the volume monitor or the progress bar
// is updated when it changes on the screen.
const MONITOR_REFRESH_RATE_HZ: number = 24;
// derived:
const MONITOR_REFRESH_INTERVAL: number = 1000 / MONITOR_REFRESH_RATE_HZ;

const CONTEXT: AudioContext = new (AudioContext || webkitAudioContext)();

///////////////////////////////////////////////////////////////////////////////
// RECORDER
///////////////////////////////////////////////////////////////////////////////

/**
 * @name WebAudioRecorder
 * @description
 * Audio Recorder functions based on WebAudio.
 */
@Injectable()
export class WebAudioRecorder {
    public mediaRecorder: MediaRecorder;
    private sourceNode: MediaElementAudioSourceNode;
    private audioGainNode: AudioGainNode;
    private analyserNode: AnalyserNode;
    private analyserBuffer: Uint8Array;
    private analyserBufferLength: number;
    private blobChunks: Blob[] = [];
    // is ready means ready to record
    public isReady: boolean = false;
    // time related
    private startedAt: number = 0;
    private pausedAt: number = 0;
    // volume and max-volume and peak stats tracking
    public currentVolume: number = 0;
    public currentTime: string = formatTime(0);
    public maxVolumeSinceReset: number;
    private nPeaksAtMax: number;
    private nPeakMeasurements: number;
    public percentPeaksAtMax: string;
    // gets called with the recorded blob as soon as we're done recording
    public onStopRecord: (recordedBlob: Blob) => void;

    constructor() {
        console.log('constructor():WebAudioRecorder');
        this.resetPeaks();
        this.initAudio();
        this.waitForAudio().subscribe(() => {
            this.startMonitoring();
        });
    }

    public waitForAudio(): Observable<void> {
        // NOTE: MAX_DB_INIT_TIME / 10
        // Check in the console how many times we loop here -
        // it shouldn't be much more than a handful
        let source: Observable<void> = Observable.create((observer) => {
            let repeat: () => void = () => {
                if (this.isReady) {
                    observer.next();
                    observer.complete();
                }
                else {
                    console.warn('... no Audio yet ...');
                    setTimeout(repeat, 50);
                }
            };
            repeat();
        });
        return source;
    }

    /**
     * Initialize audio, get it ready to record
     * @returns {void}
     */
    private initAudio(): void {
        if (!CONTEXT) {
            throw Error('AudioContext not available!');
        }

        console.log('SAMPLE RATE: ' + CONTEXT.sampleRate);

        let getUserMediaOptions: Object = { video: false, audio: true };

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // new getUserMedia is available, use it to get microphone stream
            console.log('Using NEW navigator.mediaDevices.getUserMedia');

            navigator.mediaDevices.getUserMedia(getUserMediaOptions)
                .then((stream: MediaStream) => {
                    console.log('new -> then ...');
                    this.setUpNodes(stream);
                    this.initMediaRecorder(stream);
                })
                .catch((error: any) => {
                    this.noMicrophoneAlert(error);
                });
        }
        else {
            console.log('Using OLD navigator.getUserMedia (new not there)');
            // new getUserMedia not there, try the old one
            navigator.getUserMedia = navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia;
            if (navigator.getUserMedia) {
                // old getUserMedia is available, use it
                try {
                    navigator.getUserMedia(
                        getUserMediaOptions,
                        (stream: MediaStream) => {
                            // ok we got a microphone
                            this.setUpNodes(stream);
                            this.initMediaRecorder(stream);
                        },
                        (error: any) => {
                            this.noMicrophoneAlert(error);
                        });
                }
                catch (error) {
                    alert('eyah no!');
                }
            }
            else {
                // neither old nor new getUserMedia are available
                alert([
                    'Your browser does not support the function ',
                    'getUserMedia(), please upgrade to one of the ',
                    'browsers supported by this app. Until you do so ',
                    'you will not be able to use the recording part of ',
                    'this app, but you will be able to play back audio.'
                ].join(''));
            }
        }
    }

    private noMicrophoneAlert(error: any): void {
        console.log('noMicrophoneAlert(error): error = ' + error);
        console.dir(error);
        let msg: string = [
            'This app needs the microphone to record audio with. ',
            'Your browser got no access to your microphone - ',
            'if you are running this app on a desktop, perhaps ',
            'your microphone is not connected? If so, please ',
            'connect your microphone and reload this page.'
        ].join('');
        if (error.name !== 'DevicesNotFoundError') {
            msg += [
                '\n\nError: ', error,
                '\nError name: ', error.name,
                '\nError message: ', error.message
            ].join('');
        }
        alert(msg);
    }

    /**
     * Create new MediaRecorder and set up its callbacks
     * @param {MediaStream} stream the stream obtained by getUserMedia
     * @returns {void}
     */
    private initMediaRecorder(stream: MediaStream): void {
        if (!MediaRecorder) {
            alert([
                'Your browser does not support the MediaRecorder object ',
                'used for recording audio, please upgrade to one of the ',
                'browsers supported by this app. Until you do so ',
                'you will not be able to use the recording part of ',
                'this app, but you will be able to play back audio.'
            ].join(''));
            return;
        }

        this.mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm'
        });
        console.log('MediaRecorder = ' + this.mediaRecorder);
        // feature surveying code - turn this on to discover if new formats
        // become available upon browser upgrades
        if (MediaRecorder.isTypeSupported === undefined) {
            console.warn('MediaRecorder.isTypeSupported() is undefined!');
        }
        else {
            if (MediaRecorder.isTypeSupported('audio/wav')) {
                console.log('audio/wav SUPPORTED');
            }
            if (MediaRecorder.isTypeSupported('audio/ogg')) {
                console.log('audio/ogg SUPPORTED');
            }
            if (MediaRecorder.isTypeSupported('audio/mp3')) {
                console.log('audio/mp3 SUPPORTED');
            }
            if (MediaRecorder.isTypeSupported('audio/m4a')) {
                console.log('audio/m4a SUPPORTED');
            }
            if (MediaRecorder.isTypeSupported('audio/webm')) {
                console.log('audio/webm SUPPORTED');
            }
        }

        this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
            // console.log('ondataavailable()');
            this.blobChunks.push(event.data);
        };

        this.mediaRecorder.onstop = (event: Event) => {
            console.log('mediaRecorder.onStop() Got ' +
                this.blobChunks.length + ' chunks');

            if (!this.onStopRecord) {
                throw Error('WebAudioRecorder:onStop() not set!');
            }

            // this.onStopRecord(new Blob(this.blobChunks, {
            //     type: 'audio/webm'
            // }));
            this.onStopRecord(new Blob(this.blobChunks));
            this.blobChunks = [];
        };

        // finally let users of this class know it's ready
        this.isReady = true;
        console.log('WebAudioRecorder: READY');
    }

    /**
     * Create Analyser and Gain nodes and connect them to a
     * MediaStreamDestination node, which is fed to MediaRecorder
     * @param {MediaStream} stream the stream obtained by getUserMedia
     * @returns {void}
     */
    private setUpNodes(stream: MediaStream): void {
        // create the gainNode
        this.audioGainNode = CONTEXT.createGain();

        // create and configure the analyserNode
        this.analyserNode = CONTEXT.createAnalyser();
        this.analyserNode.fftSize = 2048;
        this.analyserBufferLength = this.analyserNode.frequencyBinCount;
        this.analyserBuffer = new Uint8Array(this.analyserBufferLength);

        // create a source node out of the audio media stream
        this.sourceNode = CONTEXT.createMediaStreamSource(stream);

        // create a destination node
        let dest: MediaStreamAudioDestinationNode =
            CONTEXT.createMediaStreamDestination();

        // sourceNode (microphone) -> gainNode
        this.sourceNode.connect(this.audioGainNode);

        // gainNode -> destination
        this.audioGainNode.connect(dest);

        // gainNode -> analyserNode
        this.audioGainNode.connect(this.analyserNode);
    }

    ///////////////////////////////////////////////////////////////////////////
    // PUBLIC API METHODS
    ///////////////////////////////////////////////////////////////////////////

    // this ensures change detection every GRAPHICS_REFRESH_INTERVAL
    // setInterval(() => { }, GRAPHICS_REFRESH_INTERVAL);
    private startMonitoring(): void {
        setInterval(
            () => {
                this.analyzeVolume();
                this.currentTime = formatTime(this.getTime());
            },
            MONITOR_REFRESH_INTERVAL);
    }

    public resetPeaks(): void {
        // console.log('WebAudioRecorder:resetPeaks()');
        this.maxVolumeSinceReset = 0;
        // at first we're always at 100% peax at max
        this.percentPeaksAtMax = '100.0';
        // make this 1 to avoid NaN when we divide by it
        this.nPeakMeasurements = 1;
        // make this 1 to match nPeakMeasurements and get 100% at start
        this.nPeaksAtMax = 1;
    }

    /**
     * Compute the current latest buffer frame max volume and return it
     * @returns {void}
     */
    private analyzeVolume(): boolean {
        // for some reason this setTimeout(() => { ... }, 0) fixes all our
        // update angular2 problems (in devMode we get a million exceptions
        // without this setTimeout)
        let i: number, bufferMax: number = 0, absValue: number;
        this.analyserNode.getByteTimeDomainData(this.analyserBuffer);
        for (i = 0; i < this.analyserBufferLength; i++) {
            absValue = Math.abs(this.analyserBuffer[i] - 128.0);
            if (absValue > bufferMax) {
                bufferMax = absValue;
            }
        }

        // we use bufferMax to represent current volume
        // update some properties based on new value of bufferMax
        this.nPeakMeasurements += 1;

        if (bufferMax === this.currentVolume) {
            // no change
            return;
        }

        this.currentVolume = bufferMax;

        if (this.maxVolumeSinceReset < bufferMax) {
            this.resetPeaks();
            this.maxVolumeSinceReset = bufferMax;
        }
        else if (this.maxVolumeSinceReset === bufferMax) {
            this.nPeaksAtMax += 1;
        }

        this.percentPeaksAtMax =
            (100 * this.nPeaksAtMax / this.nPeakMeasurements).toFixed(1);

        this.currentVolume = bufferMax;
        // console.log('WebAudioRecorder:getCurrentVolume(): ' + bufferMax);
    }

    /**
     * Set the multiplier on input volume (gain) effectively changing volume
     * @param {number} factor fraction of volume, where 1.0 is no change
     * @returns {void}
     */
    public setGainFactor(factor: number): void {
        // console.log('WebAudioRecorder:setGainFactor()');
        if (!this.audioGainNode) {
            // throw Error('GainNode not initialized!');
            return;
        }
        this.audioGainNode.gain.value = factor;
    }

    private getTime(): number {
        if (this.pausedAt) {
            return this.pausedAt;
        }
        if (this.startedAt) {
            return CONTEXT.currentTime - this.startedAt;
        }
        return 0;
    }

    /**
     * Start recording
     * @returns {void}
     */
    public start(): void {
        console.log('record:start');
        if (!this.mediaRecorder) {
            throw Error('MediaRecorder not initialized! (1)');
        }
        // TODO: play around with putting the next line
        // either immediately below or immediately above the
        // start() call
        this.mediaRecorder.start();
        this.startedAt = CONTEXT.currentTime;
        this.pausedAt = 0;
    }

    /**
     * Pause recording
     * @returns {void}
     */
    public pause(): void {
        console.log('record:pause');
        if (!this.mediaRecorder) {
            throw Error('MediaRecorder not initialized! (2)');
        }
        this.mediaRecorder.pause();
        this.pausedAt = CONTEXT.currentTime - this.startedAt;
    }

    /**
     * Resume recording
     * @returns {void}
     */
    public resume(): void {
        console.log('record:resume');
        if (!this.mediaRecorder) {
            throw Error('MediaRecorder not initialized! (3)');
        }
        this.mediaRecorder.resume();
        this.pausedAt = 0;
    }

    /**
     * Stop recording
     * @returns {void}
     */
    public stop(): void {
        console.log('record:stop');
        if (!this.mediaRecorder) {
            throw Error('MediaRecorder not initialized! (4)');
        }
        this.mediaRecorder.stop();
        this.startedAt = 0;
        this.pausedAt = 0;
    }
}
