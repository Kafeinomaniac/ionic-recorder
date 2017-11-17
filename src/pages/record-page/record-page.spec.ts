import { ComponentFixture, async } from '@angular/core/testing';
import { TestUtils } from '../../test';
import { RecordPage } from '../../pages';
import { ButtonBar, VuGauge } from '../../components';

let fixture: ComponentFixture<RecordPage> = null;
let instance: any = null;

describe('pages/record-page', () => {

    beforeEach(async(() => TestUtils.beforeEachCompiler(
        [RecordPage, ButtonBar, VuGauge]
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
