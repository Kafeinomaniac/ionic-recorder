// Copyright (c) 2017 Tracktunes Inc

import { IonicRecorderApp } from './app.component';
import {
    MenuMock,
    PlatformMock,
    StatusBarMock,
    TabsMock
} from 'ionic-mocks';
import { AppStorageMock } from '../mocks';
import { LoadingPage } from '../pages';

let instance: IonicRecorderApp = null,
    appStorageMock: AppStorageMock = new AppStorageMock();

describe('app/app', () => {
    beforeEach(() => {
        instance = new IonicRecorderApp(
                <any>appStorageMock,
                <any>MenuMock.instance(),
                <any>PlatformMock.instance(),
                <any>StatusBarMock.instance()
        );

        instance['tabs'] = TabsMock.instance();
    });

    it('initialises with four possible pages', () => {
        expect(instance['pages'].length).toEqual(4);
    });

    it('has LoadingPage as its root page', () => {
        expect(instance['rootPage']).toEqual(LoadingPage);
    });

    it('opens the Record page', () => {
        instance.goToPage(instance['pages'][0]);
        expect(instance['menu']['close']).toHaveBeenCalled();
        expect(instance['tabs'].select).toHaveBeenCalledWith(1);
    });

    it('opens the Library page', () => {
        instance.goToPage(instance['pages'][1]);
        expect(instance['menu']['close']).toHaveBeenCalled();
        expect(instance['tabs'].select).toHaveBeenCalledWith(2);
    });

    it('opens the Settings page', () => {
        instance.goToPage(instance['pages'][2]);
        expect(instance['menu']['close']).toHaveBeenCalled();
        expect(instance['tabs'].select).toHaveBeenCalledWith(3);
    });

    it('opens the About page', () => {
        instance.goToPage(instance['pages'][3]);
        expect(instance['menu']['close']).toHaveBeenCalled();
        expect(instance['tabs'].select).toHaveBeenCalledWith(4);
    });

});
