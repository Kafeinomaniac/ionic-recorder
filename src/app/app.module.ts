// Copyright (c) 2017 Tracktunes Inc

import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import {
    AboutPage,
    LibraryPage,
    LoadingPage,
    MoveToPage,
    RecordPage,
    SelectionPage,
    SettingsPage,
    TrackPage
} from '../pages';
import {
    AudioPlayer,
    ButtonBar,
    ProgressSlider,
    VuGauge
} from '../components';
import {
    AppFilesystem,
    AppStorage,
    MasterClock,
    WavPlayer,
    WavRecorder
} from '../services';
import { IonicRecorderApp } from './app.component';

@NgModule({
    declarations: [
        IonicRecorderApp,
        ProgressSlider,
        AboutPage,
        LibraryPage,
        MoveToPage,
        SelectionPage,
        LoadingPage,
        RecordPage,
        SettingsPage,
        TrackPage,
        AudioPlayer,
        ButtonBar,
        VuGauge
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(IonicRecorderApp),
        IonicStorageModule.forRoot()
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        ProgressSlider,
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
        WavPlayer,
        WavRecorder,
        MasterClock
    ]
})
export class AppModule {}
