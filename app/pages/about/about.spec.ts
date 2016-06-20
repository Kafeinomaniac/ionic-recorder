// Copyright (c) 2016 Tracktunes Inc

import {
    describe,
    expect,
    it
} from '@angular/core/testing';

import {
    setUpBaseTestProviders,
    menuControllerProvider,
    InstanceFixture,
    beforeEachDI
} from '../../services/test-utils/test-utils';

import {
    AppState
} from '../../services/app-state/app-state';

import {
    AboutPage
} from './about';

setUpBaseTestProviders();

let instanceFixture: InstanceFixture = null;

describe('AboutPage', () => {
    instanceFixture = beforeEachDI(
        AboutPage,
        [AppState, menuControllerProvider],
        true,
        null
    );

    it('initialises', () => {
        expect(instanceFixture.instance).not.toBeNull();
        expect(instanceFixture.fixture).not.toBeNull();
    });
});
