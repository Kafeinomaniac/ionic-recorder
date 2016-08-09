// Copyright (c) 2016 Tracktunes Inc

export interface RecordingInfo {
    startTime: number;
    sampleRate: number;
    nSamples: number;
    encoding?: string;
    dbStartKey?: number;
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

export function mediaRecordedTypesSupported(): string[] {
    'use strict';

    if (!MediaRecorder || MediaRecorder.isTypeSupported === undefined) {
        return [];
    }

    // run ./bin/scrape_audio_mime_types.sh to get an updated list of 
    // audio mime types to watch out for in the line below
    const types: string[] = [
        'audio/aiff',
        'audio/basic',
        'audio/it',
        'audio/make',
        'audio/make.my.funk',
        'audio/mid',
        'audio/midi',
        'audio/mod',
        'audio/mpeg',
        'audio/mpeg3',
        'audio/nspaudio',
        'audio/s3m',
        'audio/tsp-audio',
        'audio/tsplayer',
        'audio/vnd.qcelp',
        'audio/voc',
        'audio/voxware',
        'audio/wav',
        'audio/webm',
        'audio/x-adpcm',
        'audio/x-aiff',
        'audio/x-au',
        'audio/x-gsm',
        'audio/x-jam',
        'audio/x-liveaudio',
        'audio/xm',
        'audio/x-mid',
        'audio/x-midi',
        'audio/x-mod',
        'audio/x-mpeg',
        'audio/x-mpeg-3',
        'audio/x-mpequrl',
        'audio/x-nspaudio',
        'audio/x-pn-realaudio',
        'audio/x-pn-realaudio-plugin',
        'audio/x-psid',
        'audio/x-realaudio',
        'audio/x-twinvq',
        'audio/x-twinvq-plugin',
        'audio/x-vnd.audioexplosion.mjuicemediafile',
        'audio/x-voc',
        'audio/x-wav'],
        len: number = types.length;

    let res: string[] = [],
        i: number,
        type: string;

    for (i = 0; i < len; i++) {
        type = types[i];
        if (MediaRecorder.isTypeSupported(type)) {
            console.log('MediaRecorder supports type: ' + type);
            res.push(type);
        }
    }

    return res;
}
