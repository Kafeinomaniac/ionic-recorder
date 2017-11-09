// Copyright (c) 2017 Loadingtunes Inc

import { ComponentFixture, async } from '@angular/core/testing';
import { TestUtils } from '../../test';
import { LoadingPage } from './loading-page';

let fixture: ComponentFixture<LoadingPage> = null;
let instance: any = null;

describe('pages/loading-page', () => {

    beforeEach(async(() => TestUtils.beforeEachCompiler(
        [LoadingPage]
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
