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
// MONITOR_REFRESH_INTERVAL is derived from MONITOR_REFRESH_RATE_HZ
const MONITOR_REFRESH_INTERVAL: number = 1000 / MONITOR_REFRESH_RATE_HZ;

const AUDIO_CONTEXT: AudioContext = (function (): AudioContext {
    if (typeof AudioContext === 'undefined') {
        if (typeof webkitAudioContext === 'undefined') {
            return null;
        }
        else {
            return new webkitAudioContext();
        }
    }
    else {
        return new AudioContext();
    }
})();

// length of script processing buffer (must be power of 2, smallest possible,
// to reduce latency and to compute time as accurately as possible)
const BUFFER_LENGTH: number = 256;

// statuses
export enum RecorderStatus {
    UNINITIALIZED,
    NO_CONTEXT,
    NO_MICROPHONE,
    NO_GETUSERMEDIA,
    GETUSERMEDIA_ERROR,
    READY
}

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

    public status: RecorderStatus;
    public sampleRate: number;
    public isInactive: boolean;
    public isRecording: boolean;
    public currentVolume: number;
    public currentTime: string;
    public maxVolumeSinceReset: number;
    public percentPeaksAtMax: string;
    public onStopRecord: (recordedBlob: Blob) => void;

    constructor() {
        console.log('constructor():WebAudioRecorder');
        this.status = RecorderStatus.UNINITIALIZED;
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
            this.status = RecorderStatus.NO_CONTEXT;
            return;
        }

        this.sampleRate = AUDIO_CONTEXT.sampleRate;
        console.log('SAMPLE RATE: ' + this.sampleRate);

        let getUserMediaOptions: Object = { video: false, audio: true };

        if (typeof navigator !== 'undefined' &&
            navigator.mediaDevices &&
            navigator.mediaDevices.getUserMedia) {
            // new getUserMedia is available, use it to get microphone stream
            // console.log('Using NEW navigator.mediaDevices.getUserMedia');
            navigator.mediaDevices.getUserMedia(getUserMediaOptions)
                .then((stream: MediaStream) => {
                    this.setUpNodes(stream);
                })
                .catch((error: any) => {
                    this.status = RecorderStatus.NO_MICROPHONE;
                });
        }
        else {
            // console.log('Using OLD navigator.getUserMedia (new not there)');
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
                            this.status = RecorderStatus.NO_MICROPHONE;
                        });
                }
                catch (error) {
                    this.status = RecorderStatus.GETUSERMEDIA_ERROR;
                }
            }
            else {
                // neither old nor new getUserMedia are available
                this.status = RecorderStatus.NO_GETUSERMEDIA;
            }
        }
    }

    /**
     * Create and set up the callback of the script processing node
     * @returns {ScriptProcessorNode} the newly created/setup node
     */
    private makeScriptProcessorNode(): ScriptProcessorNode {
        // NOTE: mono only (for now) 1 input channel 1, output channel
        let node: ScriptProcessorNode = AUDIO_CONTEXT.createScriptProcessor(
            BUFFER_LENGTH,
            1,
            1);
        node.onaudioprocess =
            (processingEvent: AudioProcessingEvent): any => {
                // console.log('setUpNodes():onaudioprocess 1');
                let inputBuffer: AudioBuffer = processingEvent.inputBuffer,
                    outputBuffer: AudioBuffer = processingEvent.outputBuffer,
                    inputData: Float32Array = inputBuffer.getChannelData(0),
                    outputData: Float32Array = outputBuffer.getChannelData(0),
                    sample: number,
                    value: number,
                    absValue: number;
                this.currentVolume = 0;
                for (sample = 0; sample < BUFFER_LENGTH; sample++) {
                    value = inputData[sample];
                    absValue = Math.abs(value);
                    if (absValue > this.currentVolume) {
                        this.currentVolume = absValue;
                    }
                    outputData[sample] = value;
                } // for (sample ...

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
        this.status = RecorderStatus.READY;
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
                // update currentTime property
                this.currentTime = formatTime(
                    this.nBuffersToSeconds(this.nEncodedBuffers));

                // update currentVolume property
                this.nPeakMeasurements += 1;
                if (this.currentVolume > this.maxVolumeSinceReset) {
                    // on new maximum, re-start counting peaks
                    this.resetPeaks();
                    this.maxVolumeSinceReset = this.currentVolume;
                }
                else if (this.currentVolume === this.maxVolumeSinceReset) {
                    this.nPeaksAtMax += 1;
                }

                // update percentPeaksAtMax property
                this.percentPeaksAtMax =
                    (100 * this.nPeaksAtMax / this.nPeakMeasurements)
                        .toFixed(1);
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
        if (this.status !== RecorderStatus.READY) {
            return;
        }
        this.audioGainNode.gain.value = factor;
    }

    /**
     * Convert from known sample-rate and buffer-size, nBuffers to seconds
     * @returns {number} Time in seconds
     */
    private nBuffersToSeconds(nBuffers: number): number {
        return this.nEncodedBuffers * 256.0 / this.sampleRate;
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
