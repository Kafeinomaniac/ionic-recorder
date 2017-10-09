// Copyright (c) 2017 Tracktunes Inc

import {
    /* tslint:disable */
    OnChanges,
    SimpleChange,
    /* tslint:enable */
    Component,
    Input
} from '@angular/core';

export interface ButtonbarButton {
    leftIcon: string;
    rightIcon?: string;
    text: string;
    clickCB: () => void;
    disabledCB?: () => boolean;
}

/**
 * Component: a bar that has buttons with two-row labels: icon(s) on
 * top and text on the bottom.
 * @class ButtonBar
 */
@Component({
    selector: 'button-bar',
    templateUrl: 'button-bar.html'
})
export class ButtonBar implements OnChanges {
    @Input() public buttons: ButtonbarButton[];
    private buttonWidth: string;

    /**
     * @constructor
     */
    constructor() {
        console.log('ButtonBar:constructor()');
        // this.buttons = [];
    }

    /**
     * Handle changes
     */
    public ngOnChanges(
        changeRecord: { [propertyName: string]: SimpleChange }
    ): void {
        if (changeRecord['buttons'] && this.buttons) {
            this.buttonWidth = (100 / this.buttons.length).toString() + '%';
        }
    }
}
