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
    beforeEachProviders,
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
    Config,
    Form,
    App,
    NavController,
    NavParams,
    Platform
} from 'ionic-angular';

import {
    provide
} from '@angular/core';

import {
    LoadingPage
} from './loading';

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

class MockClass {
    public get(): any {
        return {};
    }

    public getBoolean(): boolean {
        return true;
    }

    public getNumber(): number {
        return 42;
    }
}

describe('LoadingPage', () => {
    beforeEachProviders(() => [
        Form,
        provide(NavController, { useClass: MockClass }),
        provide(NavParams, { useClass: MockClass }),
        provide(Config, { useClass: MockClass }),
        provide(App, { useClass: MockClass }),
        provide(Platform, { useClass: MockClass })
    ]);

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
                .catch((reason: any): void => {
                    // throw the error out to the console -
                    // http://stackoverflow.com/a/30741722
                    setTimeout(function (): void { throw reason; });
                });
        }));

    it('initialises', () => {
        expect(loadingPage).not.toBeNull();
        expect(loadingPageFixture).not.toBeNull();
    });
});
