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
    setBaseTestProviders
} from '@angular/core/testing';

import {
    Observable
} from 'rxjs/Rx';

import {
    IonicRecorderApp
} from './app';

resetBaseTestProviders();
setBaseTestProviders(
    TEST_BROWSER_STATIC_PLATFORM_PROVIDERS,
    [
        BROWSER_APP_DYNAMIC_PROVIDERS,
        ADDITIONAL_TEST_BROWSER_PROVIDERS
    ]
);

class MockClass {
  public ready(): any {
    return new Promise((resolve: Function) => {
      resolve();
    });
  }

  public close(): any {
    return true;
  }

  public setRoot(): any {
    return true;
  }
}

class MockAppState {

    public getProperty(propertyName: string): Observable<any> {
        let source: Observable<any> = Observable.create((observer) => {
            console.log('PROP NAME: ' + propertyName);
            observer.next(1);
            observer.complete();
        });
        return source;
    }

    public updateProperty(
        propertyName: string,
        propertyValue: any
    ): Observable<boolean> {
        let source: Observable<boolean> = Observable.create((observer) => {
            observer.next(false);
            observer.complete();
        });
        return source;
    }
}

let app: IonicRecorderApp = null;

describe('IonicRecorderApp', () => {

    beforeEach(() => {
        let mockClass: any = (<any>new MockClass()),
            mockAppState: any = (<any>new MockAppState());
        app = new IonicRecorderApp(mockClass, mockClass, mockAppState);
    });

    it('initialises', () => {
        expect(app).not.toBeNull();
    });

});
