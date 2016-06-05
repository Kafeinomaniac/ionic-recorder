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
    private slides: Array<{
        title: string,
        description: string,
        image: string
    }>;

    constructor(
        private menuController: MenuController,
        private viewController: ViewController) {
        this.slides = [
            {
                title: [
                    'ionic-recorder web app, by ',
                    '<a href="https://tracktunes.org">Tracktunes Inc</a>'
                ].join(''),
                description: [
                    'Record audio with your browser. Organize and share your ',
                    'recordings'
                ].join(''),

                image: 'img/tracktunes-logo-text_sml-tm-w.svg'
            },
            {
                title: 'Record Page',
                description: [
                    '<b>Ionic Framework</b> is an open source SDK that ',
                    'enables developers to build high quality mobile apps ',
                    'with web technologies like HTML, CSS, and JavaScript.'
                ].join(''),
                image: 'img/ica-slidebox-img-2.png'
            },
            {
                title: ' What is Ionic Platform?',
                description: [
                    'The <b>Ionic Platform</b> is a cloud platform for ',
                    'managing and scaling Ionic apps with integrated ',
                    'services like push notifications, native builds, ',
                    'user auth, and live updating.'
                ].join(''),
                image: 'img/ica-slidebox-img-3.png'
            }
        ];
    }

    public skipIntro(): void {
        this.viewController.dismiss();
    }

    public onSlideChangeStart(slider: any): void {
        this.showSkipButton = !slider.isEnd;
    }

    public onPageDidEnter(): void {
        // the left menu should be disabled on the tutorial page
        this.menuController.enable(false);
    }

    public onPageDidLeave(): void {
        // enable the left menu when leaving the tutorial page
        this.menuController.enable(true);
    }
}
