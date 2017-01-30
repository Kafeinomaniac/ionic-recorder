// Copyright (c) 2016 Tracktunes Inc

import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { IonicRecordApp } from './app.component';
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
import { IdbAppData } from '../providers/idb-app-data/idb-app-data';
import { IdbAppFS } from '../providers/idb-app-fs/idb-app-fs';
import { IdbAppState } from '../providers/idb-app-state/idb-app-state';
import { MasterClock } from '../providers/master-clock/master-clock';

@NgModule({
    declarations: [
        IonicRecordApp,
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
        IonicModule.forRoot(IonicRecordApp)
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        IonicRecordApp,
        AboutPage,
        LibraryPage,
        LoadingPage,
        RecordPage,
        SettingsPage,
        TrackPage
    ],
    providers: [
        IdbAppData,
        IdbAppFS,
        IdbAppState,
        MasterClock
    ]
})
export class AppModule { }
