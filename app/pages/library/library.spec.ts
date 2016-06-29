// Copyright (c) 2016 Tracktunes Inc

import {
    describe,
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
    IdbAppFS
} from '../../services/idb-app-fs/idb-app-fs';

import {
    AppState
} from '../../services/app-state/app-state';

import {
    LibraryPage
} from './library';

setUpBaseTestProviders();

let instanceFixture: InstanceFixture = null;

describe('pages/library:LibraryPage', () => {
    instanceFixture = beforeEachDI(
        LibraryPage,
        [IdbAppFS, AppState, configProvider, navControllerProvider],
        true,
        null
    );

    it('initializes', () => {
        expect(instanceFixture.instance).not.toBeNull();
        expect(instanceFixture.fixture).not.toBeNull();
    });
});
