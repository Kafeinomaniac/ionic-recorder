import {Page, MenuController, ViewController} from 'ionic-angular';

/**
 * @name IntroPage
 * @description
 * A slide show with an introduction to this app.
 */
@Page({
    templateUrl: 'build/pages/intro/intro.html'
})
export class IntroPage {
    private showSkipButton: boolean = true;
    private slides: Array<{ title: string, description: string, image: string }>;

    constructor(
        private menuController: MenuController,
        private viewController: ViewController) {
        this.slides = [
            {
                title: 'ionic-recorder web app, by <a href="https://tracktunes.org">Tracktunes Inc</a>',
                description: 'Record audio with your browser. Organize and share your recordings',
                image: 'img/tracktunes-logo-text_sml-tm-w.svg',
            },
            {
                title: 'Record Page',
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

    skipIntro() {
        this.viewController.dismiss();
    }

    onSlideChangeStart(slider) {
        this.showSkipButton = !slider.isEnd;
    }

    onPageDidEnter() {
        // the left menu should be disabled on the tutorial page
        this.menuController.enable(false);
    }

    onPageDidLeave() {
        // enable the left menu when leaving the tutorial page
        this.menuController.enable(true);
    }

}
