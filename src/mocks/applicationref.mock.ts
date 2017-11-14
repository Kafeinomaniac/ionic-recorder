import {
    /* tslint:disable */
    ApplicationRef
    /* tslint:enable */
} from '@angular/core';

export class ApplicationRefMock extends ApplicationRef {
    public bootstrap(): any {
        return null;
    }

    public attachView(): any {
        return null;
    }

    public detachView(): any {
        return null;
    }

    public tick(): any {
        return null;
    }

    public componentTypes: any;
    public components: any;
    public isStable: any;
    public viewCount: any;
}
