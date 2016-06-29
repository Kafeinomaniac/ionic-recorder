// Copyright (c) 2016 Tracktunes Inc

import {
    Injectable
} from '@angular/core';

import {
    Idb,
    IdbConfig
} from '../idb/idb';

const DB_NAME: string = 'WebAudioRecordings';
const DB_VERSION: number = 1;
const STORE_NAME: string = 'RecordedChunks';

const DB_CONFIG: IdbConfig = {
    name: DB_NAME,
    version: DB_VERSION,
    storeConfigs: [
        {
            name: STORE_NAME,
            indexConfigs: []
        }
    ]
};

@Injectable()
export class IdbAppData extends Idb {
    constructor() {
        super(DB_CONFIG);
        console.log('constructor():IdbAppData');
    }
}
