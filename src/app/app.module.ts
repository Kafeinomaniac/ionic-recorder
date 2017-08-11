// Copyright (c) 2017 Tracktunes Inc

import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';

import { IonicRecorderApp } from './app.component';
import { AboutPage } from '../pages/about-page/about-page';
import { LibraryPage } from '../pages/library-page/library-page';
import { LoadingPage } from '../pages/loading-page/loading-page';
import { RecordPage } from '../pages/record-page/record-page';
import { SettingsPage } from '../pages/settings-page/settings-page';
import { TrackPage } from '../pages/track-page/track-page';
import { AudioPlay } from '../components/audio-player/audio-player';
import { ButtonBar } from '../components/button-bar/button-bar';
import { ProgressSlider } from '../components/progress-slider/progress-slider';
import { VuGauge } from '../components/vu-gauge/vu-gauge';
import { IdbAppData } from '../services/idb-app-data/idb-app-data';
import { IdbAppFS } from '../services/idb-app-fs/idb-app-fs';
import { AppState } from '../services/app-state/app-state';
import { MasterClock } from '../services/master-clock/master-clock';

@NgModule({
    declarations: [
        IonicRecorderApp,
        AboutPage,
        LibraryPage,
        LoadingPage,
        RecordPage,
        SettingsPage,
        TrackPage,
        AudioPlay,
        ButtonBar,
        ProgressSlider,
        VuGauge
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(IonicRecorderApp),
        IonicStorageModule.forRoot()
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        IonicRecorderApp,
        AboutPage,
        LibraryPage,
        LoadingPage,
        RecordPage,
        SettingsPage,
        TrackPage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        IdbAppData,
        IdbAppFS,
        AppState,
        MasterClock
    ]
})
export class AppModule {}
