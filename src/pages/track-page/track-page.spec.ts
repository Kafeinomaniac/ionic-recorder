// Copyright (c) 2017 Tracktunes Inc

import { ComponentFixture, async } from '@angular/core/testing';
import { TestUtils } from '../../test';
import { AudioPlayer, ButtonBar, ProgressSlider } from '../../components';
import { TrackPage } from './track-page';

let fixture: ComponentFixture<TrackPage> = null;
let instance: any = null;

describe('pages/track-page', () => {
    beforeEach(async(() => TestUtils.beforeEachCompiler(
        [TrackPage, AudioPlayer, ButtonBar, ProgressSlider]
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
