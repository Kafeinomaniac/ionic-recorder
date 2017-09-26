// Copyright (c) 2017 Tracktunes Inc

import {
    AboutPage,
    SelectionPage,
    LibraryPage,
    LoadingPage,
    MoveToPage,
    RecordPage,
    SettingsPage,
    TrackPage
} from '../pages';
import { AppStorage } from '../services/app-storage/app-storage';
import { AppFilesystem } from '../services';
import { AudioPlay } from '../components/audio-player/audio-player';
import { BrowserModule } from '@angular/platform-browser';
import { ButtonBar } from '../components/button-bar/button-bar';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicRecorderApp } from './app.component';
import { IonicStorageModule } from '@ionic/storage';
import { MasterClock } from '../services/master-clock/master-clock';
import { ProgressSlider } from '../components/progress-slider/progress-slider';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { VuGauge } from '../components/vu-gauge/vu-gauge';

@NgModule({
    declarations: [
        IonicRecorderApp,
        AboutPage,
        LibraryPage,
        MoveToPage,
        SelectionPage,
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
        MoveToPage,
        SelectionPage,
        LoadingPage,
        RecordPage,
        SettingsPage,
        TrackPage
    ],
    providers: [
        SplashScreen,
        StatusBar,
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        AppStorage,
        AppFilesystem,
        MasterClock
    ]
})
export class AppModule {}
