// Copyright (c) 2016 Tracktunes Inc

import {
    describe,
    expect,
    it
} from '@angular/core/testing';

import {
    menuControllerProvider,
    InstanceFixture,
    beforeEachDI
} from '../../services/test-utils/test-utils';

import {
    TrackPage
} from './track-page';

import {
    IdbAppFS
} from '../../providers/idb-app-fs/idb-app-fs';

import {
    IdbAppData
} from '../../providers/idb-app-data/idb-app-data';

import {
    MasterClock
} from '../../providers/master-clock/master-clock';

let instanceFixture: InstanceFixture = null;

describe('pages/track-page:TrackPage', () => {
    instanceFixture = beforeEachDI(
        TrackPage,
        [MasterClock, IdbAppFS, IdbAppData, menuControllerProvider],
        true,
        null
    );

    it('initializes', () => {
        expect(instanceFixture.instance).not.toBeNull();
        expect(instanceFixture.fixture).not.toBeNull();
    });
});
