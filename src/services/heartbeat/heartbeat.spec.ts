// Copyright (c) 2017 Tracktunes Inc

import { Heartbeat } from './heartbeat';
import { ApplicationRefMock } from '../../mocks';

let heartbeat: Heartbeat = null;

describe('services/heartbeat', () => {
    beforeEach(() => {
        heartbeat = new Heartbeat(new ApplicationRefMock());
    });

    it('initializes', () => {
        expect(heartbeat).not.toBeNull();
    });

});
