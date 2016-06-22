// Copyright (c) 2016 Tracktunes Inc

import {
    Idb
} from '../idb/idb';

// we'll open recordings db only once, here, for both player and recorder
export const IDB_STORE_NAME: string = 'RecordedChunks';
export const IDB: Idb =
    ((): Idb => {
        try {
            return new Idb({
                name: 'WebAudioRecordings',
                version: 1,
                storeConfigs: [
                    {
                        name: IDB_STORE_NAME,
                        indexConfigs: []
                    }
                ]
            });

        }
        catch (err) {
            return null;
        }
    })();

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
