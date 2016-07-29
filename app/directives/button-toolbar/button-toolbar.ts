// Copyright (c) 2016 Tracktunes Inc

import {
    Component,
    Input,
    OnChanges,
    SimpleChange
} from '@angular/core';

export interface ToolbarButton {
    leftIcon: string;
    rightIcon?: string;
    text: string;
    clickCB: () => void;
    disabledCB?: () => boolean;
}

/**
 * @name ButtonToolbar
 * @description
 * A toolbar that has buttons with icon(s) on top and text on the bottom
 * in the two-row labels of buttons
 */
@Component({
    selector: 'button-toolbar',
    templateUrl: 'build/directives/button-toolbar/button-toolbar.html'
})
export class ButtonToolbar implements OnChanges {
    @Input() private buttons: ToolbarButton[];
    private buttonToolbarClass: string;

    /**
     * @constructor
     */
    constructor() {
        console.log('constructor():ButtonToolbar');
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
            console.log('ButtonToolbar:ngOnChanges(): ' +
                this.buttons.length);
            this.buttonToolbarClass =
                'buttonbar' + this.buttons.length.toString();
        }
    }
}
