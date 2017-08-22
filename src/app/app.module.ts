// Copyright (c) 2017 Tracktunes Inc

import { AboutPage } from '../pages/about/about';
import { AppState } from '../services/app-state/app-state';
import { AudioPlay } from '../components/audio-player/audio-player';
import { BrowserModule } from '@angular/platform-browser';
import { ButtonBar } from '../components/button-bar/button-bar';
import {
    EditSelectionPage
} from '../pages/edit-selection/edit-selection';
import { ErrorHandler, NgModule } from '@angular/core';
import { IdbAppData } from '../services/idb-app-data/idb-app-data';
import { IdbAppFS } from '../services/idb-app-fs/idb-app-fs';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicRecorderApp } from './app.component';
import { IonicStorageModule } from '@ionic/storage';
import { LibraryPage } from '../pages/library/library';
import { LoadingPage } from '../pages/loading/loading';
import { MasterClock } from '../services/master-clock/master-clock';
import { MoveToPage } from '../pages/moveto/moveto';
import { ProgressSlider } from '../components/progress-slider/progress-slider';
import { RecordPage } from '../pages/record/record';
import { SettingsPage } from '../pages/settings/settings';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TrackPage } from '../pages/track/track';
import { VuGauge } from '../components/vu-gauge/vu-gauge';

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
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        IdbAppData,
        IdbAppFS,
        AppState,
        MasterClock
    ]
})
export class AppModule {}
