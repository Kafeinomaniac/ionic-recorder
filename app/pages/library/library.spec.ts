// Copyright (c) 2016 Tracktunes Inc

import {
    xdescribe,
    expect,
    it
} from '@angular/core/testing';

import {
    setUpBaseTestProviders,
    configProvider,
    navControllerProvider,
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
    LibraryPage
} from './library';

setUpBaseTestProviders();

let instanceFixture: InstanceFixture = null;

xdescribe('pages/library:LibraryPage', () => {
    instanceFixture = beforeEachDI(
        LibraryPage,
        [LocalDB, AppState, configProvider, navControllerProvider],
        true,
        null
    );

    it('initializes', () => {
        expect(instanceFixture.instance).not.toBeNull();
        expect(instanceFixture.fixture).not.toBeNull();
    });
});
