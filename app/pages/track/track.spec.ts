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
} from './track';

import {
    IdbAppData
} from '../../providers/idb-app-data/idb-app-data';

let instanceFixture: InstanceFixture = null;

describe('pages/track:TrackPage', () => {
    instanceFixture = beforeEachDI(
        TrackPage,
        [IdbAppData, menuControllerProvider],
        true,
        null
    );

    it('initializes', () => {
        expect(instanceFixture.instance).not.toBeNull();
        expect(instanceFixture.fixture).not.toBeNull();
    });
});
