// Copyright (c) 2017 Tracktunes Inc

import { Idb, IdbConfig } from '../../models/idb/idb';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

export const DB_NAME: string = 'IdbAppData';
export const DATA_STORE: string = 'RecordedChunks';

const DB_VERSION: number = 1;

const DB_CONFIG: IdbConfig = {
    name: DB_NAME,
    version: DB_VERSION,
    storeConfigs: [{
        name: DATA_STORE,
        indexConfigs: []
    }]
};

@Injectable()
export class IdbAppData extends Idb {
    constructor() {
        super(DB_CONFIG);
        console.log('constructor():IdbAppData');
    }

    public createChunk(item: Int16Array): Observable<number> {
        return this.create<Int16Array>(DATA_STORE, item);
    }

    public readChunk(key: number): Observable<Int16Array> {
        return this.read<Int16Array>(DATA_STORE, key);
    }
}
