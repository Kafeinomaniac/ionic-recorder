// Copyright (c) 2016 Tracktunes Inc

// this is just here for DRY-ness - things used in both web-audio-player.ts
// and web-audio-recorder.ts
export const AUDIO_CONTEXT: AudioContext =
    ((): AudioContext => {
        if (typeof window['AudioContext'] === 'undefined') {
            if (typeof window['webkitAudioContext'] === 'undefined') {
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
