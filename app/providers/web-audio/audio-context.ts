// Copyright (c) 2016 Tracktunes Inc

// this is just here for DRY-ness

export const AUDIO_CONTEXT: AudioContext = (function (): AudioContext {
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
