// Copyright (c) 2016 Tracktunes Inc

import {
    TEST_BROWSER_DYNAMIC_APPLICATION_PROVIDERS,
    TEST_BROWSER_DYNAMIC_PLATFORM_PROVIDERS
} from '@angular/platform-browser-dynamic/testing';

import {
    setBaseTestProviders
} from '@angular/core/testing';

// import {
//     IonicRecorderApp
// } from './app';

setBaseTestProviders(
    TEST_BROWSER_DYNAMIC_PLATFORM_PROVIDERS,
    TEST_BROWSER_DYNAMIC_APPLICATION_PROVIDERS
);

// let app: IonicRecorderApp = null;
