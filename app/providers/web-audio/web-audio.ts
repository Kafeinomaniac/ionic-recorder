import {Injectable} from 'angular2/core';
import {Observable} from 'rxjs';


const GETUSERMEDIA_OPTIONS: Object = { video: false, audio: true };


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

    onStop: (blob: Blob) => void;

    /**
     * constructor
     */
    constructor() {
        console.log('constructor():WebAudio');
        this.blobChunks = [];
        this.initAudio();
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

    /**
     * Wait indefinitely until web audio is ready for use, then emit Observable
     * @returns {Observable<void>} Observable that emits only
     * after web audio is ready
     */
    /*
    waitForWebAudio() {
        // NOTE: MAX_DB_INIT_TIME / 10
        // Check in the console how many times we loop here -
        // it shouldn't be much more than a handful
        let source: Observable<void> = Observable.create((observer) => {
            let repeat = () => {
                if (this.ready) {
                    observer.next();
                    observer.complete();
                }
                else {
                    console.warn('... no WEB AUDIO yet ...');
                    setTimeout(repeat, WEB_AUDIO_WAIT_MSEC);
                }
            };
            repeat();
        });
        return source;
    }
    */

    /**
     * Initialize audio, get it ready to record
     * @returns {void}
     */
    initAudio() {
        // this.audioContext = new OfflineAudioContext(1, 1024, 44100);
        // OfflineAudioContext unfortunately doesn't work with MediaRecorder
        this.audioContext = new AudioContext();

        if (!this.audioContext) {
            throw Error('AudioContext not available!');
        }

        console.log('SAMPLE RATE: ' + this.audioContext.sampleRate);

        if (!navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia) {
            // new getUserMedia not there, try the old one 
            navigator.getUserMedia = navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia;
            if (navigator.getUserMedia) {
                // the old getUserMedia
                navigator.getUserMedia(GETUSERMEDIA_OPTIONS,
                    (stream: MediaStream) => {
                        this.initAndConnectNodes(stream);
                    },
                    (error: any) => {
                        // alert('getUserMedia() - ' + error.name + ' - ' + error.message);
                        throw Error('getUserMedia() - ' + error.name + ' - ' + error.message);
                    });
            }
            else {
                alert('getUserMedia not available!');
                throw Error('getUserMedia not available!');
            }
        }
        else {
            navigator.mediaDevices.getUserMedia(GETUSERMEDIA_OPTIONS)
                .then((stream: MediaStream) => {
                    this.initAndConnectNodes(stream);
                })
                .catch((error: any) => {
                    // alert('getUserMedia() - ' + error.name + ' - ' + error.message);
                    throw Error('getUserMedia() - ' + error.name + ' - ' + error.message);
                });
        }
    }

    /**
     * Create new MediaRecorder and set up its callbacks
     * @param {MediaStream} stream the stream obtained by getUserMedia
     * @returns {void}
     */
    initMediaRecorder(stream: MediaStream) {
        if (!MediaRecorder) {
            alert('MediaRecorder not available!');
            throw Error('MediaRecorder not available!');
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

            if (!this.onStop) {
                throw Error('WebAudio:onStop() not set!');
            }

            let blob: Blob = new Blob(this.blobChunks, {
                type: 'audio/webm'
            });

            this.onStop(blob);

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
    initAndConnectNodes(stream: MediaStream) {
        console.log('WebAudio:initAndConnectNodes()');

        /* 
             this code goes together with the function playBlob below,
             which does not work - can't decode audio at all in chrome
             (we get an exception to that effect) and in Firefox, while
             it can decode the audio, it cannot play it back, it seems,
             perhaps because it already has set up the MediaRecorder (?)
             for now, we comment it out, perhaps it will be useful later...
             
        // create playback source node
        this.playbackSourceNode = this.audioContext.createBufferSource();

        this.fileReader = new FileReader();

        this.fileReader.onload = () => {
            console.log('fileReader.onload()');
            let buffer: ArrayBuffer = this.fileReader.result;
            this.audioContext.decodeAudioData(buffer,
                (audioBuffer: AudioBuffer) => {
                    this.playbackSourceNode.buffer = audioBuffer;
                    this.playbackSourceNode.connect(
                        this.audioContext.destination);
                    console.log('blob audio decoded, playing now!');
                });
        };
        */

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
    isInactive() {
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
        this.mediaRecorder.stop();
    }
    /*
    // this should work but doesn't
    playBlob(blob: Blob, duration: number = Infinity) {
        console.log('playBlob ...');
        this.fileReader.readAsArrayBuffer(blob);
    }
    */
}
