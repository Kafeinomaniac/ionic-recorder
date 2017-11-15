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
 * A bar component that has buttons with double-row labels: icon(s) on
 * top and text on the bottom.
 * @class ButtonBar
 */
@Component({
    selector: 'button-bar',
    templateUrl: 'button-bar.html'
})
export class ButtonBar implements OnChanges {
    @Input() public buttons: ButtonbarButton[];
    public buttonWidth: string;

    /**
     * @constructor
     */
    constructor() {
        console.log('constructor()');
        // this.buttons = [];
    }

    /**
     * Handle changes
     * @param {[propertyName: string]: SimpleChange}
     */
    public ngOnChanges(
        changeRecord: { [propertyName: string]: SimpleChange }
    ): void {
        if (changeRecord['buttons'] && this.buttons) {
            this.buttonWidth = (100 / this.buttons.length).toString() + '%';
        }
    }
}
