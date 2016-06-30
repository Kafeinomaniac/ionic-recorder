// Copyright (c) 2016 Tracktunes Inc

import {
    describe,
    expect,
    it
} from '@angular/core/testing';

import {
    InstanceFixture,
    beforeEachDI
} from '../../services/test-utils/test-utils';

import {
    IdbAppFS
} from '../../services/idb-app-fs/idb-app-fs';

import {
    IdbAppData
} from '../../services/idb-app-data/idb-app-data';

import {
    IdbAppState
} from '../../services/idb-app-state/idb-app-state';

import {
    WebAudioRecorder
} from '../../services/web-audio/web-audio-recorder';

import {
    RecordPage
} from './record';

let instanceFixture: InstanceFixture = null;

describe('pages/record:RecordPage', () => {
    instanceFixture = beforeEachDI(
        RecordPage,
        [
            IdbAppData,
            IdbAppFS,
            IdbAppState,
            WebAudioRecorder
        ],
        true,
        null
    );

    it('initializes', () => {
        expect(instanceFixture.instance).not.toBeNull();
        expect(instanceFixture.fixture).not.toBeNull();
    });
});
