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
    diBeforeEach
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

describe('LibraryPage', () => {
    instanceFixture = diBeforeEach(
        LibraryPage,
        [LocalDB, AppState, configProvider, navControllerProvider],
        true,
        null
    );

    it('initialises', () => {
        expect(instanceFixture.instance).not.toBeNull();
        expect(instanceFixture.fixture).not.toBeNull();
    });
});
