// Copyright (c) 2016 Tracktunes Inc

import {
    Idb
} from '../idb/idb';

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

// we'll open recordings db only once, here, for both player and recorder
export const IDB: Idb =
    ((): Idb => {
        try {
            return new Idb({
                name: 'WebAudioRecordings',
                version: 1,
                storeConfigs: [
                    {
                        name: 'RecordedChunks',
                        indexConfigs: []
                    }
                ]
            });

        }
        catch (err) {
            return null;
        }
    })();

/**
 * format time into H*:MM:SS.CC
 * @param {number} - number of seconds, float
 * @param {number} - maximum time, determines final string length/components
 * @return {string} - the time string representation
 */
export function formatTime(
    timeInSeconds: number,
    maxTimeInSeconds: number = Infinity
): string {
    'use strict';
    let nSeconds: number = Math.floor(timeInSeconds),
        // initialize the result with the centiseconds portion and period
        result: string = (timeInSeconds - nSeconds).toFixed(2).substr(1),
        addZero: (num: number) => string = (num: number) => {
            return (num < 10) ? '0' : '';
        };

    if (timeInSeconds < 60 && maxTimeInSeconds < 60) {
        // no minutes
        result = addZero(nSeconds) + nSeconds.toString() + result;
    }
    else {
        // yes minutes
        let nMinutes: number = Math.floor(nSeconds / 60.0);
        nSeconds -= nMinutes * 60;
        result = ':' + addZero(nSeconds) + nSeconds.toString() + result;
        if (timeInSeconds < 3600 && maxTimeInSeconds < 3600) {
            // no hours
            result = addZero(nMinutes) + nMinutes.toString() + result;
        }
        else {
            // yes hours
            let nHours: number = Math.floor(nMinutes / 60.0);
            nMinutes -= nHours * 60;
            result = nHours.toString() + ':' + addZero(nMinutes) +
                nMinutes.toString() + result;
        }
    }
    return result;
}
