// Copyright (c) 2017 Tracktunes Inc

import { AppStateMock } from '../services/app-state/app-state.mock';
import { IonicRecorderApp } from './app.component';
import { LibraryPage } from '../pages/library-page/library-page';
import { LoadingPage } from '../pages/loading-page/loading-page';
import { MenuMock, NavMock, PlatformMock, StatusBarMock } from 'ionic-mocks';

let instance: IonicRecorderApp = null;

describe('IonicRecorderApp', () => {
    beforeEach(() => {
        instance = new IonicRecorderApp(
            <any>PlatformMock.instance(),
            <any>MenuMock.instance(),
            <any>NavMock.instance(),
            <any>StatusBarMock.instance(),
            <any>AppStateMock);
    });

    it('initialises with four possible pages', () => {
        expect(instance['pages'].length).toEqual(4);
    });

    it('has LoadingPage as its root page', () => {
        expect(instance['rootPage']).toEqual(LoadingPage);
    });

});
