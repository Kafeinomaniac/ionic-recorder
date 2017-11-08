// Copyright (c) 2017 Tracktunes Inc

import { ComponentFixture, async } from '@angular/core/testing';
import { TestUtils } from '../../test';
import { SettingsPage } from '../../pages';

let fixture: ComponentFixture<SettingsPage> = null;
let instance: any = null;

describe('pages/settings-page', () => {

    beforeEach(async(() => TestUtils.beforeEachCompiler(
        [SettingsPage]
    ).then(compiled => {
        fixture = compiled.fixture;
        instance = compiled.instance;
        fixture.detectChanges();
    })));

    afterEach(() => {
        fixture.destroy();
    });

    it('initialises', () => {
        expect(instance).toBeTruthy();
    });
});
