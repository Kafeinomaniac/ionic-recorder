// Copyright (c) 2016 Tracktunes Inc

// Based on: https://github.com/lathonez/clicker - app/test/diExports.ts

import {
    AbstractControl,
    Control
} from '@angular/common';

import {
    Provider,
    provide,
    Type
} from '@angular/core';

import {
    ComponentFixture,
    TestComponentBuilder
} from '@angular/compiler/testing';

import {
    beforeEachProviders,
    beforeEach,
    injectAsync
} from '@angular/core/testing';

import {
    Config,
    MenuController,
    NavController,
    App,
    Form,
    Platform
} from 'ionic-angular';

///////////////////////////////////////////////////////////////////////////////
// utility functions and interfaces
///////////////////////////////////////////////////////////////////////////////

// bit of a hack here to reset the validation / state on the
// control as well as the value expecting a Control.reset() method
// to do this but there doesn't seem to be one
// http://stackoverflow.com/questions/33084280/how-to-reset-control-value
export function resetControl(control: AbstractControl): AbstractControl {
    'use strict';
    control['updateValue']('');
    control['_touched'] = false;
    control['_untouched'] = true;
    control['_pristine'] = true;
    control['_dirty'] = false;
    // control.setErrors(null);
    return control;
}

export function promiseCatchHandler(err: Error): void {
    'use strict';
    console.error('ERROR - An error has occurred inside a promise: ' + err);
    // http://stackoverflow.com/a/30741722
    setTimeout(function (): void { throw err; });
}

// stackoverflow.com/questions/2705583/how-to-simulate-a-click-with-javascript
export function eventFire(el: any, etype: string): void {
    'use strict';
    if (el.fireEvent) {
        el.fireEvent('on' + etype);
    } else {
        let evObj: any = document.createEvent('Events');
        evObj.initEvent(etype, true, false);
        el.dispatchEvent(evObj);
    }
}

///////////////////////////////////////////////////////////////////////////////
// Ionic mock classes used in specs
///////////////////////////////////////////////////////////////////////////////

export class ConfigMock {

    public get(): any {
        return '';
    }

    public getBoolean(): boolean {
        return true;
    }

    public getNumber(): number {
        return 1;
    }
}

export class NavMock {

    public pop(): any {
        return new Promise(function (resolve: Function): void {
            resolve();
        });
    }

    public push(): any {
        return new Promise(function (resolve: Function): void {
            resolve();
        });
    }

    public getActive(): any {
        return {
            'instance': {
                'model': 'something'
            }
        };
    }

    public setRoot(): any {
        return true;
    }
}

export class PlatformMock {

    public is(): any {
        return true;
    }

    public ready(): any {
        return new Promise((resolve: Function) => {
            resolve();
        });
    }
}

///////////////////////////////////////////////////////////////////////////////
// Ionic Providers used in specs
///////////////////////////////////////////////////////////////////////////////

export const appProvider: Provider =
    provide(App, { useClass: ConfigMock });

export const configProvider: Provider =
    provide(Config, { useClass: ConfigMock });

export const menuControllerProvider: Provider =
    provide(MenuController, { useClass: ConfigMock });

export const navControllerProvider: Provider =
    provide(NavController, { useClass: NavMock });

export const platformProvider: Provider =
    provide(Platform, { useClass: PlatformMock });

export interface InstanceFixture {
    instance: Type;
    fixture: ComponentFixture<Type>;
}

// note: probably none of these are needed below - they didn't solve
// the ngModel problem which we're still trying to solve
const DEFAULT_PROVIDERS: any[] = [
    Form,
    appProvider,
    configProvider,
    menuControllerProvider,
    navControllerProvider,
    platformProvider
];

///////////////////////////////////////////////////////////////////////////////
// replace beforeEach() with beforeEachDI(), which injects stuff
///////////////////////////////////////////////////////////////////////////////

export function beforeEachDI(
    component: Type,
    providers: any[],
    detectChanges: boolean,
    beforeEachCB: Function
): InstanceFixture {
    'use strict';
    let instance: Type,
        fixture: ComponentFixture<Type>;
    if (providers && providers.length) {
        beforeEachProviders(() => providers.concat(DEFAULT_PROVIDERS));
    }
    else {
        beforeEachProviders(() => DEFAULT_PROVIDERS);
    }
    beforeEach(injectAsync(
        [TestComponentBuilder],
        (testComponentBuilder: TestComponentBuilder) => {
            return testComponentBuilder
                .createAsync(component)
                .then((componentFixture: ComponentFixture<Type>) => {
                    fixture = componentFixture;
                    instance = componentFixture.componentInstance;
                    instance['control'] = new Control('');
                    if (detectChanges) componentFixture.detectChanges();
                    if (beforeEachCB) beforeEachCB(fixture);
                })
                .catch(promiseCatchHandler);
        }));
    return {
        instance: instance,
        fixture: fixture
    };
}
