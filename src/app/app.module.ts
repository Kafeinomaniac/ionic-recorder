// Copyright (c) 2017 Tracktunes Inc

import { AboutPage } from '../pages/about-page/about-page';
import { AppState } from '../services/app-state/app-state';
import { AudioPlay } from '../components/audio-player/audio-player';
import { BrowserModule } from '@angular/platform-browser';
import { ButtonBar } from '../components/button-bar/button-bar';
import {
    EditSelectionPage
} from '../pages/edit-selection-page/edit-selection-page';
import { ErrorHandler, NgModule } from '@angular/core';
import { IdbAppData } from '../services/idb-app-data/idb-app-data';
import { IdbAppFS } from '../services/idb-app-fs/idb-app-fs';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicRecorderApp } from './app.component';
import { IonicStorageModule } from '@ionic/storage';
import { LibraryPage } from '../pages/library-page/library-page';
import { LoadingPage } from '../pages/loading-page/loading-page';
import { MasterClock } from '../services/master-clock/master-clock';
import { MoveToPage } from '../pages/moveto-page/moveto-page';
import { ProgressSlider } from '../components/progress-slider/progress-slider';
import { RecordPage } from '../pages/record-page/record-page';
import { SettingsPage } from '../pages/settings-page/settings-page';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TrackPage } from '../pages/track-page/track-page';
import { VuGauge } from '../components/vu-gauge/vu-gauge';
import { File } from '@ionic-native/file';

@NgModule({
    declarations: [
        IonicRecorderApp,
        AboutPage,
        LibraryPage,
        MoveToPage,
        EditSelectionPage,
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
        EditSelectionPage,
        LoadingPage,
        RecordPage,
        SettingsPage,
        TrackPage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        File,
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        IdbAppData,
        IdbAppFS,
        AppState,
        MasterClock
    ]
})
export class AppModule {}
