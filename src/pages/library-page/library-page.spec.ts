// Copyright (c) 2017 Tracktunes Inc

import { ComponentFixture, async } from '@angular/core/testing';
import { TestUtils } from '../../test';
import { ButtonBar } from '../../components';
import { LibraryPage } from './library-page';

let fixture: ComponentFixture<LibraryPage> = null;
let instance: any = null;

describe('pages/library-page', () => {

    beforeEach(async(() => TestUtils.beforeEachCompiler(
        [LibraryPage, ButtonBar]
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
