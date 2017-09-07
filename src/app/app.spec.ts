// Copyright (c) 2017 Tracktunes Inc

import { AppStateMock } from '../services/app-state/app-state.mock';
import { IonicRecorderApp } from './app.component';
import { LoadingPage } from '../pages';
import { MenuMock, PlatformMock, StatusBarMock } from 'ionic-mocks';

let instance: IonicRecorderApp = null;

describe('IonicRecorderApp', () => {
    beforeEach(() => {
        instance = new IonicRecorderApp(
            <any>PlatformMock.instance(),
            <any>MenuMock.instance(),
            <any>StatusBarMock.instance(),
            <any>AppStateMock);
    });

    it('initialises with four possible pages', () => {
        expect(instance['pages'].length).toEqual(5);
    });

    it('has LoadingPage as its root page', () => {
        expect(instance['rootPage']).toEqual(LoadingPage);
    });

});
