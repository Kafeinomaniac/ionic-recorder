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

describe('pages/loading:LoadingPage', () => {
    instanceFixture = beforeEachDI(
        LoadingPage,
        [],
        true,
        null
    );

    it('initializes', () => {
        expect(instanceFixture.instance).not.toBeNull();
        expect(instanceFixture.fixture).not.toBeNull();
    });
});
