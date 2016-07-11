// Copyright (c) 2016 Tracktunes Inc

// Based on: https://github.com/lathonez/clicker - app/test/diExports.ts

import {
    resetControl
} from './test-utils';

import {
    AbstractControl,
    Control
} from '@angular/common';

import {
    describe,
    expect,
    it
} from '@angular/core/testing';

describe('utils/test-utils:resetControl()', () => {

    it('resets a control', () => {
        let control: Control = new Control(''),
            returnedControl: AbstractControl = null;
        control.markAsTouched();
        control.updateValue('dave');
        returnedControl = resetControl(control);
        expect(returnedControl.touched).toBe(false);
        expect(returnedControl.untouched).toBe(true);
        expect(returnedControl.pristine).toBe(true);
        expect(returnedControl.dirty).toBe(false);
        expect(returnedControl.value).toBe('');
    });
});
