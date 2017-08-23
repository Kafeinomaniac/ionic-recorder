// Copyright (c) 2017 Tracktunes Inc

export const WAV_MIME_TYPE: string = 'audio/wav';

export interface RecordingInfo {
    // 'dateCreated', 'sampleRate', and 'nSamples' get filled in
    // web-audio/record.ts:stop() - these are always added
    dateCreated: number;
    sampleRate: number;
    nSamples: number;
    // the properties 'encoding', 'dbStartKey' and 'size'
    // get added in record-wav.ts
    encoding?: string;
    dbStartKey?: number;
    size?: number;
    // the properties 'duration', 'displayDuration', 'fileName', 'folderPath',
    // 'displayDateCreated' and 'fileSize' get added in track.ts
    duration?: number;
    displayDuration?: string;
    fileName?: string;
    folderPath?: string;
    displayDateCreated?: string;
    fileSize?: number;
    dbKey?: string;
}

// this is just here for DRY-ness - things used in both player.ts
// and recorder.ts
export const AUDIO_CONTEXT: AudioContext =
    ((): AudioContext => {
        let context: AudioContext = null;
        window['AudioContext'] =
            window['AudioContext'] || window['webkitAudioContext'];
        try {
            context = new AudioContext();
        }
        catch (err) {
            alert('Web Audio API is not supported in this browser');
        }
        return context;
    })();
