// Copyright (c) 2016 Tracktunes Inc

import {
    Injectable
} from '@angular/core';

import {
    formatTime
} from '../../utils/utils';

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
    private nPeaksAtMax: number;
    private nPeakMeasurements: number;
    private intervalId: NodeJS.Timer;
    private timeoutId: NodeJS.Timer;
    // count # of buffers we have encoded (== time)
    private nEncodedBuffers: number;

    public isReady: boolean;
    public isInactive: boolean;
    public isRecording: boolean;
    public currentVolume: number;
    public currentTime: string;
    public maxVolumeSinceReset: number;
    public percentPeaksAtMax: string;
    public onStopRecord: (recordedBlob: Blob) => void;

    constructor() {
        console.log('constructor():WebAudioRecorder');
        this.isReady = false;
        this.intervalId = null;
        this.timeoutId = null;

        this.stop();
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
                    this.setUpNodes(stream);
                })
                .catch((error: any) => {
                    // this.stopWaitingForAudio();
                    this.stopMonitoring();
                    this.noMicrophoneAlert(error);
                });
        }
        else {
            console.log('Using OLD navigator.getUserMedia (new not there)');
            // new getUserMedia not there, try the old one
            let getUserMedia: NavigatorGetUserMedia = navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia;
            if (getUserMedia) {
                // old getUserMedia is available, use it
                try {
                    getUserMedia(
                        getUserMediaOptions,
                        (stream: MediaStream) => {
                            this.setUpNodes(stream);
                        },
                        (error: any) => {
                            // this.stopWaitingForAudio();
                            this.stopMonitoring();
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

    /**
     * Show error message alert
     * @param {any} error object with .name and .message fields
     * @returns {void}
     */
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
     * Create and set up the callback of the script processing node
     * @returns {ScriptProcessorNode} the newly created/setup node
     */
    private makeScriptProcessorNode(): ScriptProcessorNode {
        let node: ScriptProcessorNode = AUDIO_CONTEXT.createScriptProcessor(
            BUFFER_LENGTH,
            N_CHANNELS,
            N_CHANNELS);
        node.onaudioprocess =
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
                if (this.isRecording) {
                    this.nEncodedBuffers++;
                }
            }; // this.scriptProcessorNode.onaudioprocess = ...
        return node;
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
        this.scriptProcessorNode = this.makeScriptProcessorNode();

        // create a source node out of the audio media stream
        this.sourceNode = AUDIO_CONTEXT.createMediaStreamSource(stream);

        // create a destination node (need something to connect the
        // scriptProcessorNode with or else it won't process audio)
        let dest: MediaStreamAudioDestinationNode =
            AUDIO_CONTEXT.createMediaStreamDestination();

        // sourceNode (microphone) -> gainNode
        this.sourceNode.connect(this.audioGainNode);

        // gainNode -> scriptProcessorNode
        this.audioGainNode.connect(this.scriptProcessorNode);

        // scriptProcessorNode -> destination
        this.scriptProcessorNode.connect(dest);

        // finally, start monitoring audio volume levels
        this.startMonitoring();

        // and you can tell the world we're ready
        this.isReady = true;
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

    /**
     * Ensures change detection every GRAPHICS_REFRESH_INTERVAL
     * @returns {void}
     */
    public startMonitoring(): void {
        this.intervalId = setInterval(
            () => {
                this.analyzeVolume();
                this.currentTime = formatTime(
                    this.nBuffersToSeconds(this.nEncodedBuffers));
            },
            MONITOR_REFRESH_INTERVAL);
    }

    /**
     * Stops monitoring (stops change detection)
     * @returns {void}
     */
    public stopMonitoring(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Reset all peak stats as if we've just started playing audio at
     * time 0. Call this when you want to compute stats from now.
     * @returns {void}
     */
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
        if (!this.isReady) {
            return;
        }
        // we're ready
        if (!this.audioGainNode) {
            // but there is no gain node, very strange ...
            throw Error('GainNode not initialized!');
        }
        this.audioGainNode.gain.value = factor;
    }

    /**
     * Convert from known sample-rate and buffer-size, nBuffers to seconds
     * @returns {number} Time in seconds
     */
    private nBuffersToSeconds(nBuffers: number): number {
        return this.nEncodedBuffers * 256.0 /
            AUDIO_CONTEXT.sampleRate;
    }

    /**
     * Start recording
     * @returns {void}
     */
    public start(): void {
        this.isRecording = true;
        this.isInactive = false;
    }

    /**
     * Pause recording
     * @returns {void}
     */
    public pause(): void {
        this.isRecording = false;
    }

    /**
     * Resume recording
     * @returns {void}
     */
    public resume(): void {
        this.isRecording = true;
    }

    /**
     * Stop recording
     * @returns {void}
     */
    public stop(): void {
        this.nEncodedBuffers = 0;
        this.isRecording = false;
        this.isInactive = true;
    }
}
