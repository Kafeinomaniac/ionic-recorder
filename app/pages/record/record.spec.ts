// Copyright (c) 2016 Tracktunes Inc

import {
    xdescribe,
    expect,
    it
} from '@angular/core/testing';

import {
    setUpBaseTestProviders,
    InstanceFixture,
    beforeEachDI
} from '../../services/test-utils/test-utils';

import {
    LocalDB
} from '../../services/local-db/local-db';

import {
    AppState
} from '../../services/app-state/app-state';

import {
    WebAudioRecorder
} from '../../services/web-audio/web-audio-recorder';

import {
    RecordPage
} from './record';

setUpBaseTestProviders();

let instanceFixture: InstanceFixture = null;

xdescribe('RecordPage', () => {
    instanceFixture = beforeEachDI(
        RecordPage,
        [LocalDB, AppState, WebAudioRecorder],
        true,
        null
    );

    it('initialises', () => {
        expect(instanceFixture.instance).not.toBeNull();
        expect(instanceFixture.fixture).not.toBeNull();
    });
});
