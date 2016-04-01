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
    private functions: { [id: string]: Function } = {};

    /**
     * constructor
     */
    constructor() {
        console.log('constructor():MasterClock');
        this.ngZone.runOutsideAngular(() => {
            let startTime: number = Date.now(),
                timeoutError: number,
                id: string,
                repeat: Function = () => {
                    this.nTicks++;

                    this.ngZone.run(() => {
                        for (id in this.functions) {
                            this.functions[id]();
                        }
                    });

                    timeoutError = Date.now() - startTime -
                        this.nTicks * CLOCK_TIMEOUT_MSEC;

                    setTimeout(repeat, CLOCK_TIMEOUT_MSEC - timeoutError);
                }; // repeat: Function = () => {
            setTimeout(repeat, CLOCK_TIMEOUT_MSEC);
        }); // this.ngZone.runOutsideAngular(() => {
    }

    /**
     * Access the singleton class instance via MasterClock.Instance
     * @returns {MasterClock} the singleton instance of this class
     */
    static get Instance() {
        if (!this.instance) {
            this.instance = new MasterClock();
        }
        return this.instance;
    }

    /**
     * Add a function to execute on each clock loop
     * @param {string} id used as handle to added function, for later removal
     * @param {Function} function to execute in the clock's loop
     * @returns {void}
     */
    addFunction(id: string, fun: Function) {
        this.functions[id] = fun;
    }

    /**
     * Remove a function to execute on each clock loop, via its id
     * @param {string} id of function to remove
     * @returns {void}
     */
    removeFunction(id: string) {
        delete this.functions[id];
    }

}