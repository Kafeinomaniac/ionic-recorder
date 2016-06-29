// Copyright (c) 2016 Tracktunes Inc

import {
    Injectable
} from '@angular/core';

import {
    IdbDict
} from '../idb/idb-dict';

const DB_NAME: string = 'appStateIdbDict';
const DB_VERSION: number = 1;

@Injectable()
export class IdbAppState extends IdbDict {
    constructor() {
        super(DB_NAME, DB_VERSION);
    }
}
