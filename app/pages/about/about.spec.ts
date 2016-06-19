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
    provide
} from '@angular/core';

import {
    MenuController
} from 'ionic-angular';

import {
    AboutPage
} from './about';

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

class MockClass {
    public get(): any {
        return '';
    }

    public getBoolean(): boolean {
        return true;
    }

    public getNumber(): number {
        return 42;
    }
}

let aboutPage: AboutPage = null;
let aboutPageFixture: ComponentFixture<AboutPage> = null;

describe('AboutPage', () => {
    beforeEachProviders(() => [
        AppState,
        provide(MenuController, { useClass: MockClass })
    ]);

    beforeEach(injectAsync(
        [TestComponentBuilder],
        (tcb: TestComponentBuilder) => {
            return tcb
                .createAsync(AboutPage)
                .then((componentFixture: ComponentFixture<AboutPage>) => {
                    aboutPageFixture = componentFixture;
                    aboutPage = componentFixture.componentInstance;
                    aboutPageFixture.detectChanges();
                })
                .catch((reason: any): void => {
                    // throw the error out to the console -
                    // http://stackoverflow.com/a/30741722
                    setTimeout(function (): void { throw reason; });
                });
        }));

    it('initialises', () => {
        expect(aboutPage).not.toBeNull();
        expect(aboutPageFixture).not.toBeNull();
    });
});
