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

let instanceFixture: InstanceFixture = null;

describe('pages/track:TrackPage', () => {
    instanceFixture = beforeEachDI(
        TrackPage,
        [menuControllerProvider],
        true,
        null
    );

    it('initializes', () => {
        expect(instanceFixture.instance).not.toBeNull();
        expect(instanceFixture.fixture).not.toBeNull();
    });
});
