// Copyright (c) 2017 Abouttunes Inc

import { ComponentFixture, async } from '@angular/core/testing';
import { TestUtils } from '../../test';
import { AboutPage } from '../../pages';

let fixture: ComponentFixture<AboutPage> = null;
let instance: any = null;

describe('pages/about-page', () => {

    beforeEach(async(() => TestUtils.beforeEachCompiler(
        [AboutPage]
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
