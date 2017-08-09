import {
    IonicRecorderApp
}
from './app.component';
import {
    MenuMock,
    PlatformMock,
    StatusBarMock
}
from 'ionic-mocks';
import {
    AppStateMock
}
from '../providers/app-state/app-state.mock';
import {
    LibraryPage
}
from '../pages/library-page/library-page';
import {
    LoadingPage
}
from '../pages/loading-page/loading-page';

let instance: IonicRecorderApp = null;

describe('IonicRecorderApp', () => {
    beforeEach(() => {
        instance = new IonicRecorderApp(
            <any>PlatformMock.instance(),
            <any>MenuMock.instance(),
            <any>StatusBarMock.instance(),
            <any>AppStateMock)
    });

    it('initialises with four possible pages', () => {
        expect(instance['pages'].length).toEqual(4);
    });

    it('has LoadingPage as its root page', () => {
        expect(instance['rootPage']).toEqual(LoadingPage);
    });

});
