// Copyright (c) 2017 Tracktunes Inc

import { ComponentFixture, async } from '@angular/core/testing';
import { TestUtils } from '../../test';
import { SelectionPage } from '../../pages';
import { ButtonBar } from '../../components';

let fixture: ComponentFixture<SelectionPage> = null;
let instance: any = null;

describe('pages/selection-page', () => {

    beforeEach(async(() => TestUtils.beforeEachCompiler(
        [ButtonBar, SelectionPage]
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
