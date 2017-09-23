// Copyright (c) 2017 Tracktunes Inc

/** @constant {AudioContext} */
export const AUDIO_CONTEXT: AudioContext =
    ((): AudioContext => {
        let context: AudioContext = null;
        window['AudioContext'] =
            window['AudioContext'] || window['webkitAudioContext'];
        try {
            context = new AudioContext({ latencyHint: 'playback' });
        }
        catch (err) {
            alert('Web Audio API is not supported in this browser');
        }
        return context;
    })();
