// Copyright (c) 2016 Tracktunes Inc

import {
    ADDITIONAL_TEST_BROWSER_PROVIDERS,
    TEST_BROWSER_STATIC_PLATFORM_PROVIDERS
} from '@angular/platform-browser/testing/browser_static';

import {
    BROWSER_APP_DYNAMIC_PROVIDERS
} from '@angular/platform-browser-dynamic';

import {
    resetBaseTestProviders,
    setBaseTestProviders,
    beforeEach,
    describe,
    expect,
    injectAsync,
    it
} from '@angular/core/testing';

import {
    ComponentFixture,
    TestComponentBuilder
} from '@angular/compiler/testing';

import {
    LoadingPage
} from './loading';

import {
    promiseCatchHandler
} from '../../services/test-utils/test-utils';

resetBaseTestProviders();
setBaseTestProviders(
    TEST_BROWSER_STATIC_PLATFORM_PROVIDERS,
    [
        BROWSER_APP_DYNAMIC_PROVIDERS,
        ADDITIONAL_TEST_BROWSER_PROVIDERS
    ]
);

let loadingPage: LoadingPage = null;
let loadingPageFixture: ComponentFixture<LoadingPage> = null;

describe('LoadingPage', () => {

    beforeEach(injectAsync(
        [TestComponentBuilder],
        (tcb: TestComponentBuilder) => {
            return tcb
                .createAsync(LoadingPage)
                .then((componentFixture: ComponentFixture<LoadingPage>) => {
                    loadingPageFixture = componentFixture;
                    loadingPage = componentFixture.componentInstance;
                    loadingPageFixture.detectChanges();
                })
                .catch(promiseCatchHandler);
        }));

    it('initialises', () => {
        expect(loadingPage).not.toBeNull();
        expect(loadingPageFixture).not.toBeNull();
    });
});
