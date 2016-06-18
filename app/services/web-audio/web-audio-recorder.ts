// Copyright (c) 2016 Tracktunes Inc

import {
    Injectable
} from '@angular/core';

import {
    AUDIO_CONTEXT,
    formatTime
} from './web-audio-common';

// sets the frame-rate at which either the volume monitor or the progress bar
// is updated when it changes on the screen.
const MONITOR_REFRESH_RATE_HZ: number = 24;

// MONITOR_REFRESH_INTERVAL is derived from MONITOR_REFRESH_RATE_HZ
const MONITOR_REFRESH_INTERVAL: number = 1000 / MONITOR_REFRESH_RATE_HZ;

// length of script processing buffer (must be power of 2, smallest possible,
// to reduce latency and to compute time as accurately as possible)
const PROCESSING_BUFFER_LENGTH: number = 256;

// make this a multiple of PROCESSING_BUFFER_LENGTH
const DB_CHUNK_LENGTH: number = 512 * PROCESSING_BUFFER_LENGTH;

// pre-allocate the DB_CHUNK
const DB_CHUNK: Float32Array = new Float32Array(DB_CHUNK_LENGTH);

// statuses
export enum RecorderStatus {
    // uninitialized means we have not been initialized yet
    UNINITIALIZED_STATE,
    // error occured - no AudioContext
    NO_CONTEXT_ERROR,
    // error occured - no microphone
    NO_MICROPHONE_ERROR,
    // error occured - no getUserMedia()
    NO_GETUSERMEDIA_ERROR,
    // error occured - getUserMedia() has crashed
    GETUSERMEDIA_ERROR,
    // normal operation
    READY_STATE
}

/**
 * Create a string that reflects the time now, at 1 second resolution
 * @return {string} - human readable text representation of time now
 */
function makeTimestamp(): string {
    'use strict';
    let now: Date = new Date();
    return [
        now.getFullYear().toString(),
        '-',
        (now.getMonth() + 1).toString(),
        '-',
        now.getDate().toString(),
        ' -- ',
        now.toLocaleTimeString()
    ].join('');
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
    // count # of buffers we have encoded; this is also how we count time
    private nRecordedProcessingBuffers: number;
    private nDbBuffers: number;
    private dbChunkIndex: number;
    private lastDbFileName: string;

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

        if (!AUDIO_CONTEXT) {
            this.status = RecorderStatus.NO_CONTEXT_ERROR;
            return;
        }

        this.status = RecorderStatus.UNINITIALIZED_STATE;

        // create nodes that do not require a stream in their constructor
        this.createNodes();
        // this call to stop() initializes a lot of private variables
        this.stop();
        // this call to resetPeaks() also initializes private variables
        this.resetPeaks();
        // grab microphone, init nodes that rely on stream, connect nodes
        this.initAudio();
    }

    /**
     * Initialize audio, get it ready to record
     * @returns {void}
     */
    private initAudio(): void {
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
                    this.connectNodes(stream);
                })
                .catch((error: any) => {
                    this.status = RecorderStatus.NO_MICROPHONE_ERROR;
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
                            this.connectNodes(stream);
                        },
                        (error: any) => {
                            this.status = RecorderStatus.NO_MICROPHONE_ERROR;
                        });
                }
                catch (error) {
                    this.status = RecorderStatus.GETUSERMEDIA_ERROR;
                }
            }
            else {
                // neither old nor new getUserMedia are available
                this.status = RecorderStatus.NO_GETUSERMEDIA_ERROR;
            }
        }
    }

    /**
     * Create audioGainNode & scriptProcessorNode
     * @returns {void}
     */
    private createNodes(): void {
        // create the gainNode
        this.audioGainNode = AUDIO_CONTEXT.createGain();

        // create and configure the scriptProcessorNode
        this.scriptProcessorNode = AUDIO_CONTEXT.createScriptProcessor(
            PROCESSING_BUFFER_LENGTH,
            1,
            1);
        this.scriptProcessorNode.onaudioprocess =
            (processingEvent: AudioProcessingEvent): any => {
                let inputBuffer: AudioBuffer = processingEvent.inputBuffer,
                    inputData: Float32Array = inputBuffer.getChannelData(0),
                    i: number,
                    value: number,
                    absValue: number;
                // put the maximum of current buffer into this.currentVolume
                this.currentVolume = 0;
                for (i = 0; i < PROCESSING_BUFFER_LENGTH; i++) {
                    value = inputData[i];
                    absValue = Math.abs(value);
                    if (absValue > 1) {
                        absValue = 1;
                    }
                    if (absValue > this.currentVolume) {
                        this.currentVolume = absValue;
                    }
                    if (this.isRecording) {
                        if (this.nRecordedProcessingBuffers === 0 &&
                            this.dbChunkIndex === 0) {
                            // we are at the very beginning, at 1st sample
                            // set the filename to use for this recording
                            // according to the time now
                            this.lastDbFileName = makeTimestamp();
                        }
                        if (this.dbChunkIndex === DB_CHUNK_LENGTH) {
                            console.log('Saving chunk ' + this.nDbBuffers +
                                '; Filename: ' + this.lastDbFileName);
                            this.nDbBuffers++;
                            this.dbChunkIndex = 0;
                        }
                        else {
                            // keep filling up DB_CHUNK
                            DB_CHUNK[this.dbChunkIndex] = value;
                            this.dbChunkIndex++;
                        }
                    }
                } // for (i ...
                if (this.isRecording) {
                    // this is how we keep track of recording time
                    this.nRecordedProcessingBuffers++;
                }
            }; // this.scriptProcessorNode.onaudioprocess = ...
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
    private connectNodes(stream: MediaStream): void {
        // create a source node out of the audio media stream
        // (the other nodes, which do not require a stream for their
        // initialization, are created in this.createNodes())
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
        this.status = RecorderStatus.READY_STATE;
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
            // the monitoring actions are in the following function:
            () => {
                // update currentTime property
                this.currentTime = formatTime(
                    this.nBuffersToSeconds(this.nRecordedProcessingBuffers));

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
        this.audioGainNode.gain.value = factor;
        this.resetPeaks();
    }

    /**
     * Convert from known sample-rate and buffer-size, nBuffers to seconds
     * @returns {number} Time in seconds
     */
    private nBuffersToSeconds(nBuffers: number): number {
        return this.nRecordedProcessingBuffers * 256.0 / this.sampleRate;
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
        this.isRecording = false;
        this.isInactive = true;
        // finish off saving the last of it
        if (this.dbChunkIndex) {
            // we have some samples left
            console.log('Saving chunk ' + this.nDbBuffers +
                ' (# samples = ' + this.dbChunkIndex + ')' +
                '; Filename: ' + this.lastDbFileName);
        }
        this.nRecordedProcessingBuffers = 0;
        this.nDbBuffers = 0;
        this.dbChunkIndex = 0;
    }
}
