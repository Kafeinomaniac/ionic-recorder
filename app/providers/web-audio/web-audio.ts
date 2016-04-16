import {Injectable} from 'angular2/core';
import {Observable} from 'rxjs';


// amount of time we wait between checks to see if web audio is ready
// const WEB_AUDIO_WAIT_MSEC: number = 50;

// NOTE: currently this only works in the latest versions of Firefox
// because Chrome/Chromium cannot handle AudioDestinationNode streams yet


@Injectable()
export class WebAudio {
    // 'instance' is used as part of Singleton pattern implementation
    private static instance: WebAudio = null;

    private audioContext: AudioContext;
    private audioGainNode: AudioGainNode;
    private mediaRecorder: MediaRecorder;
    private analyserNode: AnalyserNode;
    private analyserBuffer: Uint8Array;
    private analyserBufferLength: number;
    private sourceNode: MediaElementAudioSourceNode;
    private blobChunks: Blob[];
    private playbackSourceNode: AudioBufferSourceNode;
    private ready: boolean = false;
    private fileReader: FileReader;

    // time related
    private recordStartTime: number = 0;
    private recordLastPauseTime: number = 0;
    private recordTotalPauseTime: number = 0;

    getRecordingTime() {
        return this.audioContext.currentTime -
            this.recordStartTime -
            this.recordTotalPauseTime;
    }

    private playbackStartTime: number = 0;
    private playbackLastPauseTime: number = 0;
    private playbackTotalPauseTime: number = 0;

    getPlaybackTime() {
        if (this.isPlaying) {
            return this.audioContext.currentTime -
                this.playbackStartTime -
                this.playbackTotalPauseTime;
        }
        else {
            return 0;
        }
    }

    // gets called with the recorded blob as soon as we're done recording
    onStopRecord: (recordedBlob: Blob) => void;

    // this is the last function call just before we start playback
    onStartPlayback: () => void;

    // gets called as soon as we stop playback or are done playing audio
    onStopPlayback: () => void;

    // if we're playing, holds current audio buffer being played or paused
    // if we're done playing, this is back to null
    playbackAudioBuffer: AudioBuffer = null;

    isPlaying: boolean = false;

    playbackInactive: boolean = true;

    /**
     * constructor
     */
    constructor() {
        console.log('constructor():WebAudio');
        this.blobChunks = [];
        this.setUpPlayback();
        this.initWebAudio();
    }

    /**
     * Access the singleton class instance via WebAudio.Instance
     * @returns {WebAudio} the singleton instance of this class
     */
    static get Instance() {
        if (!this.instance) {
            this.instance = new WebAudio();
        }
        return this.instance;
    }

    setUpPlayback() {
        console.log('WebAudio:setUpPlayback()');
        // this code goes together with the function playBlob below,
        // which does not work - can't decode audio at all in chrome
        // (we get an exception to that effect) and in Firefox, while
        // it can decode the audio, it cannot play it back, it seems,
        // perhaps because it already has set up the MediaRecorder (?)
        // for now, we comment it out, perhaps it will be useful later...

        this.fileReader = new FileReader();

        this.fileReader.onload = () => {
            console.log('fileReader.onload()');
            let buffer: ArrayBuffer = this.fileReader.result;
            // create playback source node
            // it has to be created new for each playback
            this.playbackSourceNode = this.audioContext.createBufferSource();

            // make sure we call our playback-end callback when
            // audio ends by hooking into its event handler
            this.playbackSourceNode.onended = () => {
                this.isPlaying = false;
                this.playbackInactive = true;
                this.onStopPlayback();
            }

            this.audioContext.decodeAudioData(buffer,
                (audioBuffer: AudioBuffer) => {

                    this.playbackSourceNode.buffer = audioBuffer;
                    this.playbackSourceNode.connect(
                        this.audioContext.destination);

                    // track currently playing AudioBuffer so that we
                    // can refer to it from other places, like the
                    // onStartPlayback() callback directly below
                    this.playbackAudioBuffer = audioBuffer;
                    this.onStartPlayback();

                    // TODO: play around with putting the next line
                    // either immediately below or immediately above the
                    // start() call
                    this.playbackStartTime = this.audioContext.currentTime;
                    this.playbackSourceNode.start(0);
                    console.log('blob audio decoded, playing! duration: ' +
                        audioBuffer.duration);
                },
                () => {
                    alert([
                        'Your browser had recorded the audio file you are ',
                        'playing and then it save it to a local file on ',
                        'your device, but it now reports that it cannot ',
                        'play that audio file  We expect this problem to ',
                        'be fixed soon as more audio file formats get ',
                        'handled by modern browsers but we are looking for ',
                        'alternative playback solutions. In the meantime, ',
                        'you can share the fles you want to play to your ',
                        'device and play them with any music player on your ',
                        'device. But oops, sorry, we will implement sharing ',
                        'soon!'
                    ].join(''));
                });

        };
    }

    /**
     * Initialize audio, get it ready to record
     * @returns {void}
     */
    initWebAudio() {
        // this.audioContext = new OfflineAudioContext(1, 1024, 44100);
        // OfflineAudioContext unfortunately doesn't work with MediaRecorder
        this.audioContext = new AudioContext();

        if (!this.audioContext) {
            throw Error('AudioContext not available!');
        }

        console.log('SAMPLE RATE: ' + this.audioContext.sampleRate);

        let getUserMediaOptions = { video: false, audio: true };

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // new getUserMedia is available, use it to get microphone stream
            console.log('Using NEW navigator.mediaDevices.getUserMedia');
            navigator.mediaDevices.getUserMedia(getUserMediaOptions)
                .then((stream: MediaStream) => {
                    this.setUpNodes(stream);
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
                        },
                        (error: any) => {
                            this.noMicrophoneAlert(error);
                        });
                }
                catch (error) {
                    alert('eyah!');
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

    noMicrophoneAlert(error: any) {
        let msg = [
            'This app needs the microphone to record audio with.',
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
    initMediaRecorder(stream: MediaStream) {
        if (!MediaRecorder) {
            alert('MediaRecorder not available!');
            let msg = [
                'Your browser does not support the MediaRecorder object ',
                'used for recording audio, please upgrade to one of the ',
                'browsers supported by this app. Until you do so ',
                'you will not be able to use the recording part of ',
                'this app, but you will be able to play back audio.'
            ].join('');
        }

        this.mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm'
        });

        if (MediaRecorder.isTypeSupported === undefined) {
            console.warn('MediaRecorder.isTypeSupported() is undefined!');
        }
        else {
            if (MediaRecorder.isTypeSupported('audio/wav')) {
                console.log('audio/wav SUPPORTED');
            }
            else if (MediaRecorder.isTypeSupported('audio/ogg')) {
                console.log('audio/ogg SUPPORTED');
            }
            else if (MediaRecorder.isTypeSupported('audio/mp3')) {
                console.log('audio/mp3 SUPPORTED');
            }
            else if (MediaRecorder.isTypeSupported('audio/m4a')) {
                console.log('audio/m4a SUPPORTED');
            }
            else if (MediaRecorder.isTypeSupported('audio/webm')) {
                console.log('audio/webm SUPPORTED');
            }
            else {
                console.warn('Could not find supported type');
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
                throw Error('WebAudio:onStop() not set!');
            }

            // let blob: Blob = new Blob(this.blobChunks, {
            //     type: 'audio/webm'
            // });
            let blob: Blob = new Blob(this.blobChunks);

            this.onStopRecord(blob);

            this.blobChunks = [];
        };

        // finally let users of this class know it's ready
        this.ready = true;
    }

    /**
     * Create Analyser and Gain nodes and connect them to a
     * MediaStreamDestination node, which is fed to MediaRecorder
     * @param {MediaStream} stream the stream obtained by getUserMedia
     * @returns {void}
     */
    setUpNodes(stream: MediaStream) {
        console.log('WebAudio:setUpRecording()');

        // create the gainNode
        this.audioGainNode = this.audioContext.createGain();

        // create and configure the analyserNode
        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 2048;
        this.analyserBufferLength = this.analyserNode.frequencyBinCount;
        this.analyserBuffer = new Uint8Array(this.analyserBufferLength);

        // create a source node out of the audio media stream
        this.sourceNode = this.audioContext.createMediaStreamSource(stream);

        // create a destination node
        let dest: MediaStreamAudioDestinationNode =
            this.audioContext.createMediaStreamDestination();

        // sourceNode (microphone) -> gainNode
        this.sourceNode.connect(this.audioGainNode);

        // gainNode -> destination
        this.audioGainNode.connect(dest);

        // gainNode -> analyserNode
        this.audioGainNode.connect(this.analyserNode);

        // this.initMediaRecorder(stream);
        this.initMediaRecorder(dest.stream);
    }

    /**
     * Compute the current latest buffer frame max volume and return it
     * @returns {number} max volume in range of [0,128]
     */
    getBufferMaxVolume() {
        if (!this.analyserNode) {
            return 0;
        }

        let i: number, bufferMax: number = 0, absValue: number;
        this.analyserNode.getByteTimeDomainData(this.analyserBuffer);
        for (i = 0; i < this.analyserBufferLength; i++) {
            absValue = Math.abs(this.analyserBuffer[i] - 128.0);
            if (absValue > bufferMax) {
                bufferMax = absValue;
            }
        }
        // console.log('WebAudio:getBufferMaxVolume(): ' + bufferMax);
        return bufferMax;
    }

    /**
     * Set the multiplier on input volume (gain) effectively changing volume
     * @param {number} factor fraction of volume, where 1.0 is no change
     * @returns {void}
     */
    setGainFactor(factor: number) {
        if (!this.audioGainNode) {
            throw Error('GainNode not initialized!');
        }
        this.audioGainNode.gain.value = factor;
    }

    /**
     * Are we recording right now?
     * @returns {boolean} whether we are recording right now
     */
    isRecording() {
        return this.mediaRecorder &&
            (this.mediaRecorder.state === 'recording');
    }

    /**
     * Is MediaRecorder state inactive now?
     * @returns {boolean} whether MediaRecorder is inactive now
     */
    recordingInactive() {
        // TODO: get rid of !this.mediaRecorder here and everywhere
        // else
        return !this.mediaRecorder ||
            this.mediaRecorder.state === 'inactive';
    }

    /**
     * Start recording
     * @returns {void}
     */
    startRecording() {
        if (!this.mediaRecorder) {
            throw Error('MediaRecorder not initialized! (1)');
        }
        // TODO: play around with putting the next line
        // either immediately below or immediately above the
        // start() call
        this.recordStartTime = this.audioContext.currentTime;
        this.mediaRecorder.start();
    }

    /**
     * Pause recording
     * @returns {void}
     */
    pauseRecording() {
        if (!this.mediaRecorder) {
            throw Error('MediaRecorder not initialized! (2)');
        }
        // TODO: play around with putting the next line
        // either immediately below or immediately above the
        // pause() call
        this.recordLastPauseTime = this.audioContext.currentTime;
        this.mediaRecorder.pause();
    }

    /**
     * Resume recording
     * @returns {void}
     */
    resumeRecording() {
        if (!this.mediaRecorder) {
            throw Error('MediaRecorder not initialized! (3)');
        }
        // TODO: play around with putting the next line
        // either immediately below or immediately above the
        // resume() call
        this.recordTotalPauseTime +=
            this.audioContext.currentTime + this.recordLastPauseTime;
        this.mediaRecorder.resume();
    }

    /**
     * Stop recording
     * @returns {void}
     */
    stopRecording() {
        if (!this.mediaRecorder) {
            throw Error('MediaRecorder not initialized! (4)');
        }
        this.recordTotalPauseTime = 0;
        this.mediaRecorder.stop();
    }

    // this should work but doesn't
    startPlayback(blob: Blob) {
        console.log('playBlob ... ' + blob);
        // already set up the onload callback to start playing ...
        this.fileReader.readAsArrayBuffer(blob);
        this.isPlaying = true;
        this.playbackInactive = false;
    }

    pausePlayback() {
        console.log('pausePlayback');
        this.isPlaying = false;

        // TODO: play around with putting the next line
        // either immediately below or immediately above the
        // disconnect() call
        this.playbackLastPauseTime = this.audioContext.currentTime;
        this.playbackSourceNode.disconnect();
    }

    resumePlayback() {
        console.log('resumePlayback');
        this.isPlaying = true;
        // TODO: play around with putting the next line
        // either immediately below or immediately above the
        // connect() call
        this.playbackTotalPauseTime +=
            this.audioContext.currentTime + this.playbackLastPauseTime;
        this.playbackSourceNode.connect(this.audioContext.destination);
    }

    stopPlayback() {
        console.log('resumePlayback');
        this.playbackTotalPauseTime = 0;
        this.playbackSourceNode.stop(0);
        this.playbackInactive = true;
    }

    seekPlayback(seconds: number) {
        // first set things up
        this.playbackSourceNode.loopStart = seconds;
        this.playbackSourceNode.loopEnd = this.playbackAudioBuffer.duration;
        // stop then restart with the new setup
        this.playbackSourceNode.stop(0);
        this.playbackSourceNode.start(0);
    }

}
