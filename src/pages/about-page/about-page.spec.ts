// Copyright (c) 2017 Abouttunes Inc

// demonstration on how to manually compile the test bed (as
// opposed to calling TestUtils)

import {
    async,
    fakeAsync,
    ComponentFixture,
    TestBed
} from '@angular/core/testing';
import {
    App,
    Config,
    DomController,
    IonicModule,
    Keyboard,
    MenuController,
    NavController,
    Platform
} from 'ionic-angular';
import {
    ConfigMock,
    PlatformMock
} from 'ionic-mocks';
import { AboutPage }      from './about-page';

let fixture: ComponentFixture<AboutPage> = null;
let instance: any = null;

describe('pages/about-page', () => {
    // demonstration on how to manually compile the test bed (as
    // opposed to calling test.ts:TestUtils)
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AboutPage],
            providers: [
                App,
                DomController,
                Keyboard,
                MenuController,
                NavController,
                {provide: Config, useFactory: () => ConfigMock.instance()},
                {provide: Platform, useFactory: () => PlatformMock.instance()},
            ],
            imports: [
                IonicModule,
            ],
        }).compileComponents().then(() => {
            fixture = TestBed.createComponent(AboutPage);
            instance = fixture;
            fixture.detectChanges();
        });
    }));

    afterEach(() => {
        fixture.destroy();
    });

    it('should create AboutPage', () => {
        expect(fixture).toBeTruthy();
        expect(instance).toBeTruthy();
    });

});
