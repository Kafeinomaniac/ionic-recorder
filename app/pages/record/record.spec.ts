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
    RecordPage
} from './record';

import {
    LocalDB
} from '../../services/local-db/local-db';

import {
    AppState
} from '../../services/app-state/app-state';

resetBaseTestProviders();
setBaseTestProviders(
    TEST_BROWSER_STATIC_PLATFORM_PROVIDERS,
    [
        BROWSER_APP_DYNAMIC_PROVIDERS,
        ADDITIONAL_TEST_BROWSER_PROVIDERS
    ]
);

let recordPage: RecordPage = null;
let recordPageFixture: ComponentFixture<RecordPage> = null;

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

describe('RecordPage', () => {
    beforeEachProviders(() => [
        Form,
        provide(NavController, { useClass: MockClass }),
        provide(NavParams, { useClass: MockClass }),
        provide(Config, { useClass: MockClass }),
        provide(App, { useClass: MockClass }),
        provide(Platform, { useClass: MockClass }),
        // provide(LocalDB, { useClass: MockClass }),
        // provide(AppState, { useClass: MockClass })
        LocalDB,
        AppState
    ]);

    beforeEach(injectAsync(
        [TestComponentBuilder],
        (tcb: TestComponentBuilder) => {
            return tcb
                .createAsync(RecordPage)
                .then((componentFixture: ComponentFixture<RecordPage>) => {
                    recordPageFixture = componentFixture;
                    recordPage = componentFixture.componentInstance;
                    recordPageFixture.detectChanges();
                })
                .catch((reason: any): void => {
                    // throw the error out to the console -
                    // http://stackoverflow.com/a/30741722
                    setTimeout(function (): void { throw reason; });
                });
        }));

    it('initialises', () => {
        expect(recordPage).not.toBeNull();
        expect(recordPageFixture).not.toBeNull();
    });
});
