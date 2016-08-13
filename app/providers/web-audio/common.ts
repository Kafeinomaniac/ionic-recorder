// Copyright (c) 2016 Tracktunes Inc

export const WAV_MIME_TYPE: string = 'audio/wav';

export interface RecordingInfo {
    dateCreated: number;
    sampleRate: number;
    nSamples: number;
    encoding?: string;
    dbStartKey?: number;
    size?: number;
}

// this is just here for DRY-ness - things used in both player.ts
// and recorder.ts
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
