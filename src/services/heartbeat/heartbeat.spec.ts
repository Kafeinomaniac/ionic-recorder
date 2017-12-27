// Copyright (c) 2017 Tracktunes Inc

import { CLOCK_INTERVAL_MSEC, Heartbeat } from './heartbeat';
import { ApplicationRefMock } from '../../mocks';

let heartbeat: Heartbeat = null,
    accum: number = 0;

describe('services/heartbeat', () => {
    beforeEach(() => {
        heartbeat = new Heartbeat(<any>(new ApplicationRefMock()));
    });

    it('initializes', () => {
        expect(heartbeat).not.toBeNull();
    });

    it('starts, runs and ends', (done) => {
        heartbeat.start();
        heartbeat.addFunction('a', () => {
            accum++;
        });
        setTimeout(
            () => {
                heartbeat.removeFunction('a');
                heartbeat.stop();
                expect(accum).not.toEqual(0);
                done();
            },
            2 * CLOCK_INTERVAL_MSEC
        );
    });

});
