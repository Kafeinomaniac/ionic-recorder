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
} from '../../providers/idb-app-fs/idb-app-fs';

import {
    IdbAppData
} from '../../providers/idb-app-data/idb-app-data';

import {
    IdbAppState
} from '../../providers/idb-app-state/idb-app-state';

import {
    WebAudioRecorder
} from '../../providers/web-audio/recorder';

import {
    MasterClock
} from '../../providers/master-clock/master-clock';

import {
    RecordPage
} from './record-page';

let instanceFixture: InstanceFixture = null;

describe('pages/record-page:RecordPage', () => {
    instanceFixture = beforeEachDI(
        RecordPage,
        [
            MasterClock,
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
