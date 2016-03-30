// Copyright (c) 2016 Tracktunes Inc

import {Injectable} from 'angular2/core';
import {NgZone} from 'angular2/core';


// clock frequency, in Hz
const CLOCK_FREQUENCY_HZ: number = 24;

// derived constants, please do not touch the constants below:
const CLOCK_TIMEOUT_MSEC: number = 1000.0 / CLOCK_FREQUENCY_HZ;


@Injectable()
export class MasterClock {
    // 'instance' is used as part of Singleton pattern implementation
    private static instance: MasterClock = null;
    private nTicks: number = 0;
    private ngZone: NgZone = new NgZone({ enableLongStackTrace: false });
    private functions: Array<Function> = [];

    constructor() {
        console.log('constructor():MasterClock');
        this.ngZone.runOutsideAngular(() => {
            let startTime: number = Date.now(),
                timeoutError: number,
                i: any,
                repeat: Function = () => {
                    this.nTicks++;

                    this.ngZone.run(() => {
                        for (i in this.functions) {
                            this.functions[i]();
                        }
                    });

                    timeoutError = Date.now() - startTime -
                        this.nTicks * CLOCK_TIMEOUT_MSEC;

                    setTimeout(repeat, CLOCK_TIMEOUT_MSEC - timeoutError);
                }; // repeat: Function = () => {
            setTimeout(repeat, CLOCK_TIMEOUT_MSEC);
        }); // this.ngZone.runOutsideAngular(() => {
    }

    addFunction(addedFunction: Function) {
        this.functions.push(addedFunction);
    }

    getTicks() {
        return this.nTicks;
    }

    getTotalTime() {
        return this.nTicks * CLOCK_TIMEOUT_MSEC;
    }

    // Singleton pattern implementation
    static get Instance() {
        if (!this.instance) {
            this.instance = new MasterClock();
        }
        return this.instance;
    }

}