// Copyright (c) 2017 Tracktunes Inc

import { AppStorageMock } from '../services/app-storage/app-storage.mock';
import { IonicRecorderApp } from './app.component';
import { LoadingPage } from '../pages';
import { MenuMock, PlatformMock, StatusBarMock } from 'ionic-mocks';

let instance: IonicRecorderApp = null;

describe('app/app', () => {
    beforeEach(() => {
        instance = new IonicRecorderApp(
            <any>PlatformMock.instance(),
            <any>MenuMock.instance(),
            <any>StatusBarMock.instance(),
            <any>AppStorageMock);
    });

    it('initialises with four possible pages', () => {
        expect(instance['pages'].length).toEqual(4);
    });

    it('has LoadingPage as its root page', () => {
        expect(instance['rootPage']).toEqual(LoadingPage);
    });

});
