import {Page, NavController, MenuController} from 'ionic-angular';
import {TabsPage} from '../tabs/tabs';


@Page({
    templateUrl: 'build/pages/intro/intro.html'
})
export class TutorialPage {
    private showSkipButton: boolean = true;
    private slides: Array<{ title: string, description: string, image: string }>;
    static get parameters() {
        return [[NavController], [MenuController]];
    }

    constructor(private nav: NavController, private menu: MenuController) {
        this.slides = [
            {
                title: 'Ionic Recorder app, by <a href="https://tracktunes.org">Tracktunes Inc</a>',
                description: 'The <b>Ionic Recorder App</b> is a practical preview of the Ionic Framework in action, and a demonstration of proper code use.',
                image: 'img/ica-slidebox-img-1.png',
            },
            {
                title: 'What is Ionic?',
                description: '<b>Ionic Framework</b> is an open source SDK that enables developers to build high quality mobile apps with web technologies like HTML, CSS, and JavaScript.',
                image: 'img/ica-slidebox-img-2.png',
            },
            {
                title: ' What is Ionic Platform?',
                description: 'The <b>Ionic Platform</b> is a cloud platform for managing and scaling Ionic apps with integrated services like push notifications, native builds, user auth, and live updating.',
                image: 'img/ica-slidebox-img-3.png',
            }
        ];
    }

    startApp() {
        this.nav.push(TabsPage);
    }

    onSlideChangeStart(slider) {
        this.showSkipButton = !slider.isEnd;
    }

    onPageDidEnter() {
        // the left menu should be disabled on the tutorial page
        this.menu.enable(false);
    }

    onPageDidLeave() {
        // enable the left menu when leaving the tutorial page
        this.menu.enable(true);
    }

}
