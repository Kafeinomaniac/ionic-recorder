// Copyright (c) 2016 Tracktunes Inc

import {
    Injectable
} from '@angular/core';

import {
    formatTime
} from '../utils/format-time';

// sets the frame-rate at which either the volume monitor or the progress bar
// is updated when it changes on the screen.
const MONITOR_REFRESH_RATE_HZ: number = 24;

const MONITOR_REFRESH_INTERVAL: number = 1000 / MONITOR_REFRESH_RATE_HZ;

const AUDIO_CONTEXT: AudioContext = new (AudioContext || webkitAudioContext)();

// length of script processing buffer (must be power of 2, smallest possible,
// to reduce latency and to compute time as accurately as possible)
const BUFFER_LENGTH: number = 256;

// number of input channels and number of output channels
const N_CHANNELS: number = 1;

const NO_MICROPHONE_MSG: string = [
    'This app needs the microphone to record audio with. Your browser got no ',
    'access to your microphone - if this app is running on a desktop, ensure ',
    'your microphone is connected (you may need to reload this page).'
].join('');

const NO_GETUSERMEDIA_MSG: string = [
    'Your browser does not support the function getUserMedia(). Please ',
    'upgrade to the latest version of Chrome (50 or above), if you want ',
    'to use the recording part of this app.'
].join('');

const NO_MEDIARECORDER_MSG: string = [
    'Your browser does not support the MediaRecorder object ',
    'used for recording audio, please upgrade to one of the ',
    'browsers supported by this app. Until you do so ',
    'you will not be able to use the recording part of ',
    'this app, but you will be able to play back audio.'
].join('');

/**
 * @name WebAudioRecorder
 * @description
 * Audio Recorder functions based on WebAudio.
 */
@Injectable()
export class WebAudioRecorder {
    private sourceNode: MediaElementAudioSourceNode;
    private audioGainNode: AudioGainNode;
    private scriptProcessorNode: ScriptProcessorNode;
    private blobChunks: Blob[];
    private startedAt: number;
    private pausedAt: number;
    private nPeaksAtMax: number;
    private nPeakMeasurements: number;
    private setIntervalId: NodeJS.Timer;

    public mediaRecorder: MediaRecorder;
    public isReady: boolean;
    public currentVolume: number;
    public currentTime: string;
    public maxVolumeSinceReset: number;
    public percentPeaksAtMax: string;
    public onStopRecord: (recordedBlob: Blob) => void;

    constructor() {
        console.log('constructor():WebAudioRecorder');
        this.isReady = false;
        this.blobChunks = [];
        this.startedAt = 0;
        this.pausedAt = 0;

        this.currentVolume = 0;
        this.currentTime = formatTime(0);
        this.resetPeaks();
        this.initAudio();
    }

    /**
     * Initialize audio, get it ready to record
     * @returns {void}
     */
    private initAudio(): void {
        if (!AUDIO_CONTEXT) {
            throw Error('AudioContext not available!');
        }

        console.log('SAMPLE RATE: ' + AUDIO_CONTEXT.sampleRate);

        let getUserMediaOptions: Object = { video: false, audio: true };

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // new getUserMedia is available, use it to get microphone stream
            console.log('Using NEW navigator.mediaDevices.getUserMedia');

            navigator.mediaDevices.getUserMedia(getUserMediaOptions)
                .then((stream: MediaStream) => {
                    console.log('new -> then ...');
                    this.setUpNodes(stream);
                    this.initMediaRecorder(stream);
                    this.startMonitoring();
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
                            this.startMonitoring();
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
                alert(NO_GETUSERMEDIA_MSG);
            }
        }
    }

    private noMicrophoneAlert(error: any): void {
        console.log('noMicrophoneAlert(error): error = ' + error);
        console.dir(error);
        alert([
            NO_MICROPHONE_MSG,
            '\n\nError: ', error,
            '\nError name: ', error.name,
            '\nError message: ', error.message
        ].join(''));
    }

    /**
     * Create new MediaRecorder and set up its callbacks
     * @param {MediaStream} stream the stream obtained by getUserMedia
     * @returns {void}
     */
    private initMediaRecorder(stream: MediaStream): void {
        if (!MediaRecorder) {
            alert(NO_MEDIARECORDER_MSG);
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
     * Create the following nodes:
     * this.sourceNode (createMediaStreamSourceNode)
     * |--> this.gainNode (createGain)
     *      |--> this.scriptProcessorNode (createScriptProcessor)
     *           |--> MediaStreamAudioDestinationNode
     * @param {MediaStream} stream the stream obtained by getUserMedia
     * @returns {void}
     */
    private setUpNodes(stream: MediaStream): void {
        // create the gainNode
        this.audioGainNode = AUDIO_CONTEXT.createGain();

        // create and configure the scriptProcessorNode

        this.scriptProcessorNode = AUDIO_CONTEXT.createScriptProcessor(
            BUFFER_LENGTH,
            N_CHANNELS,
            N_CHANNELS);
        console.log('setUpNodes()');
        this.scriptProcessorNode.onaudioprocess =
            (processingEvent: AudioProcessingEvent): any => {
                // console.log('setUpNodes():onaudioprocess 1');
                let inputBuffer: AudioBuffer = processingEvent.inputBuffer,
                    outputBuffer: AudioBuffer = processingEvent.outputBuffer,
                    inputData: Float32Array,
                    outputData: Float32Array,
                    channel: number,
                    sample: number,
                    value: number,
                    absValue: number;
                for (channel = 0; channel < N_CHANNELS; channel++) {
                    inputData = inputBuffer.getChannelData(channel);
                    outputData = outputBuffer.getChannelData(channel);
                    value = 0;
                    absValue = 0;
                    this.currentVolume = 0;
                    for (sample = 0; sample < BUFFER_LENGTH; sample++) {
                        value = inputData[sample];
                        absValue = Math.abs(value);
                        if (absValue > this.currentVolume) {
                            this.currentVolume = absValue;
                        }
                        outputData[sample] = value;
                    } // for (sample ...
                } // for (channel ...
            }; // this.scriptProcessorNode.onaudioprocess = ...

        // create a source node out of the audio media stream
        this.sourceNode = AUDIO_CONTEXT.createMediaStreamSource(stream);

        // create a destination node
        let dest: MediaStreamAudioDestinationNode =
            AUDIO_CONTEXT.createMediaStreamDestination();

        // sourceNode (microphone) -> gainNode
        this.sourceNode.connect(this.audioGainNode);

        // gainNode -> scriptProcessorNode
        this.audioGainNode.connect(this.scriptProcessorNode);

        // gainNode -> destination
        // this.audioGainNode.connect(dest);

        // scriptProcessorNode -> destination
        this.scriptProcessorNode.connect(dest);
    }

    /**
     * Compute the current latest buffer frame max volume and return it
     * @returns {void}
     */
    private analyzeVolume(): void {
        // we use currentVolume to represent current volume
        // update some properties based on new value of currentVolume
        this.nPeakMeasurements += 1;

        // volume has changed, update this.currentVolume

        if (this.currentVolume > this.maxVolumeSinceReset) {
            // on new maximum, re-start counting peaks
            this.resetPeaks();
            this.maxVolumeSinceReset = this.currentVolume;
        }
        else if (this.currentVolume === this.maxVolumeSinceReset) {
            this.nPeaksAtMax += 1;
        }

        this.percentPeaksAtMax =
            (100 * this.nPeaksAtMax / this.nPeakMeasurements)
                .toFixed(1);
    }

    ///////////////////////////////////////////////////////////////////////////
    // PUBLIC API METHODS
    ///////////////////////////////////////////////////////////////////////////
    // this ensures change detection every GRAPHICS_REFRESH_INTERVAL
    // setInterval(() => { }, GRAPHICS_REFRESH_INTERVAL);

    public startMonitoring(): void {
        this.setIntervalId = setInterval(
            () => {
                this.analyzeVolume();
                this.currentTime = formatTime(this.getTime());
            },
            MONITOR_REFRESH_INTERVAL);
    }

    public stopMonitoring(): void {
        clearInterval(this.setIntervalId);
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

    /**
     * Returns current time that takes into account pausing, so if we're
     * paused, returns the last paused at time.
     * @returns {number}
     */
    private getTime(): number {
        if (this.pausedAt) {
            return this.pausedAt;
        }
        if (this.startedAt) {
            return AUDIO_CONTEXT.currentTime - this.startedAt;
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
        this.startedAt = AUDIO_CONTEXT.currentTime;
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
        this.pausedAt = AUDIO_CONTEXT.currentTime - this.startedAt;
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
