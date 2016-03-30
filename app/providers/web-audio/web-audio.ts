import {Injectable} from 'angular2/core';


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

    private playbackSource: AudioBufferSourceNode;

    onStop: (blob: Blob) => void;

    constructor() {
        console.log('constructor():WebAudio');
        this.blobChunks = [];
        this.initAudio();
    }

    // Singleton pattern implementation
    static get Instance() {
        if (!this.instance) {
            this.instance = new WebAudio();
        }
        return this.instance;
    }

    initAudio() {
        // this.audioContext = new OfflineAudioContext(1, 1024, 44100);
        // OfflineAudioContext unfortunately doesn't work with MediaRecorder
        this.audioContext = new AudioContext();
        if (!this.audioContext) {
            throw Error('AudioContext not available!');
        }
        this.audioGainNode = this.audioContext.createGain();
        if (!navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia) {
            throw Error('mediaDevices.getUserMedia not available!');
        }
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream: MediaStream) => {
                this.connectNodes(stream);
                this.initMediaRecorder(stream);
            })
            .catch((error: any) => {
                // alert('getUserMedia() - ' + error.name + ' - ' + error.message);
                throw Error('getUserMedia() - ' + error.name + ' - ' + error.message);
            });
    }

    initMediaRecorder(stream: MediaStream) {
        if (!MediaRecorder) {
            alert('MediaRecorder not available!');
            throw Error('MediaRecorder not available!');
        }
        /*
        if (MediaRecorder.isTypeSupported('audio/wav')) {
            console.log('audio/wav SUPPORTED!!!!!!!');
        }
        else if (MediaRecorder.isTypeSupported('audio/ogg')) {
            console.log('audio/ogg SUPPORTED!!!!!!!');
        }
        else if (MediaRecorder.isTypeSupported('audio/mp3')) {
            console.log('audio/mp3 SUPPORTED!!!!!!!');
        }
        else if (MediaRecorder.isTypeSupported('audio/m4a')) {
            console.log('audio/m4a SUPPORTED!!!!!!!');
        }
        else if (MediaRecorder.isTypeSupported('audio/webm')) {
            console.log('audio/webm SUPPORTED!!!!!!!');
        }
        else {
            console.log('UNSUPPORTED !!!!!!!!!!!');
            console.dir(MediaRecorder.isTypeSupported);
            console.log(MediaRecorder.isTypeSupported);
        }
        */
        this.mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm'
        });

        this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
            // console.log('ondataavailable()');
            this.blobChunks.push(event.data);
        };

        this.mediaRecorder.onstop = (event: Event) => {
            console.log('mediaRecorder.onStop() Got ' + this.blobChunks.length + 'chunks');
            if (!this.onStop) {
                throw Error('WebAudio:onStop() not set!');
            }

            let blob: Blob = new Blob(this.blobChunks, {
                type: 'audio/webm'
            });

            this.onStop(blob);

            this.blobChunks = [];
        };
    }

    connectNodes(stream: MediaStream) {
        console.log('WebAudio:connectNodes()');
        this.sourceNode = this.audioContext.createMediaStreamSource(stream);
        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 2048;
        this.analyserBufferLength = this.analyserNode.frequencyBinCount;
        this.analyserBuffer = new Uint8Array(this.analyserBufferLength);

        // source --> gain-node
        this.sourceNode.connect(this.audioGainNode);
        // gain-node --> destination

        // NOTE: uncommenting the line below and placing the mic next
        // to an ongoing speaker can create some awesome feedback effects
        // This next line repeats microphone input to speaker output
        // this.audioGainNode.connect(this.audioContext.destination);
        this.audioGainNode.connect(this.analyserNode);
    }

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

    setGainFactor(factor: number) {
        if (!this.audioGainNode) {
            throw Error('GainNode not initialized!');
        }
        this.audioGainNode.gain.value = factor;
    }

    isRecording() {
        return this.mediaRecorder &&
            (this.mediaRecorder.state === 'recording');
    }

    isInactive() {
        return !this.mediaRecorder ||
            this.mediaRecorder.state === 'inactive';
    }

    startRecording() {
        if (!this.mediaRecorder) {
            throw Error('MediaRecorder not initialized! (1)');
        }
        this.mediaRecorder.start();
    }

    pauseRecording() {
        if (!this.mediaRecorder) {
            throw Error('MediaRecorder not initialized! (2)');
        }
        this.mediaRecorder.pause();
    }

    resumeRecording() {
        if (!this.mediaRecorder) {
            throw Error('MediaRecorder not initialized! (3)');
        }
        this.mediaRecorder.resume();
    }

    stopRecording() {
        if (!this.mediaRecorder) {
            throw Error('MediaRecorder not initialized! (4)');
        }
        this.mediaRecorder.stop();
    }
}
