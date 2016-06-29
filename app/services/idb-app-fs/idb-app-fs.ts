// Copyright (c) 2016 Tracktunes Inc

import {
    Injectable
} from '@angular/core';

import {
    IdbFS
} from '../idb/idb-fs';

const DB_NAME: string = 'IdbAppFS';
const DB_VERSION: number = 1;

@Injectable()
export class IdbAppFS extends IdbFS {
    constructor() {
        super(DB_NAME, DB_VERSION);
    }
}
