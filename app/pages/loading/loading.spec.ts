// Copyright (c) 2016 Tracktunes Inc

import {
    describe,
    expect,
    it
} from '@angular/core/testing';

import {
    setUpBaseTestProviders,
    InstanceFixture,
    beforeEachDI
} from '../../services/test-utils/test-utils';

import {
    LoadingPage
} from './loading';

setUpBaseTestProviders();

let instanceFixture: InstanceFixture = null;

describe('LoadingPage', () => {
    instanceFixture = beforeEachDI(
        LoadingPage,
        [],
        true,
        null
    );

    it('initialises', () => {
        expect(instanceFixture.instance).not.toBeNull();
        expect(instanceFixture.fixture).not.toBeNull();
    });
});
