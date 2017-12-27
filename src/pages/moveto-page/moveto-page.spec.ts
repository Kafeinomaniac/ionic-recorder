// Copyright (c) 2017 Tracktunes Inc

import { ComponentFixture, async } from '@angular/core/testing';
import { TestUtils } from '../../test';
import { MoveToPage } from '../../pages';
import { ButtonBar } from '../../components';

let fixture: ComponentFixture<MoveToPage> = null;
let instance: any = null;

describe('pages/moveto-page', () => {

    beforeEach(async(() => TestUtils.beforeEachCompiler(
        [MoveToPage, ButtonBar]
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
