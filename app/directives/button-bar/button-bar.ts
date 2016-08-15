// Copyright (c) 2016 Tracktunes Inc

import {
    Component,
    Input,
    OnChanges,
    SimpleChange
} from '@angular/core';

export interface BarButton {
    leftIcon: string;
    rightIcon?: string;
    text: string;
    clickCB: () => void;
    disabledCB?: () => boolean;
}

/**
 * @name ButtonBar
 * @description
 * A bar that has buttons with two-row labels: icon(s) on top
 * and text on the bottom
 */
@Component({
    selector: 'button-bar',
    templateUrl: 'build/directives/button-bar/button-bar.html'
})
export class ButtonBar implements OnChanges {
    @Input() private buttons: BarButton[];
    private buttonWidth: string;

    /**
     * @constructor
     */
    constructor() {
        console.log('constructor():ButtonBar');
        this.buttons = [];
    }
    /**
     * Handle changes (play new song) when a new song (url) is loaded
     * @returns {void}
     */
    public ngOnChanges(
        changeRecord: { [propertyName: string]: SimpleChange }
    ): void {
        if (changeRecord['buttons'] && this.buttons) {
            this.buttonWidth = (100 / this.buttons.length).toString() + '%';
        }
    }
}
