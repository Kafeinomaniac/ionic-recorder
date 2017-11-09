// Copyright (c) 2017 Tracktunes Inc

import { IonicRecorderApp } from './app.component';
import { MenuMock, PlatformMock, StatusBarMock } from 'ionic-mocks';
import { AppStorageMock } from '../services/mocks';
import { LoadingPage } from '../pages';

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
