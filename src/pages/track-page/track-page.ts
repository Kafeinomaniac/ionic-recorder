// Copyright (c) 2017 Tracktunes Inc

import { Component } from '@angular/core';
import { ActionSheetController, NavParams } from 'ionic-angular';
import { ButtonbarButton } from '../../components';
import { WavPlayer } from '../../services';
import {
    pathDirectoryName,
    formatDate,
    WAV_MIME_TYPE,
    WavFile,
    WavInfo
} from '../../models';

/**
 * @class TrackPage
 */
@Component({
    selector: 'track-page',
    templateUrl: 'track-page.html'
})
export class TrackPage {
    private actionSheetController: ActionSheetController;
    public footerButtons: ButtonbarButton[];
    public filePath: string;
    public dateModified: string;
    public encoding: string;
    public duration: string;
    public fileSize: number;
    public sampleRate: number;
    public nSamples: number;
    public parentDirectory: string;
    private player: WavPlayer;

    /**
     * @constructor
     * @param {NavParams}
     * @param {ActionSheetController}
     * @param {WavPlayer}
     */
    constructor(
        navParams: NavParams,
        actionSheetController: ActionSheetController,
        wavPlayer: WavPlayer
    ) {
        console.log('constructor(' + navParams.data + ')');

        // grab data sent over from the caller of this page - full path of file
        this.filePath = navParams.data;

        this.actionSheetController = actionSheetController;
        this.player = wavPlayer;
        this.parentDirectory = pathDirectoryName(this.filePath);
        this.encoding = WAV_MIME_TYPE;

        WavFile.readWavFileInfo(this.filePath).subscribe(
            (wavInfo: WavInfo) => {
                this.nSamples = wavInfo.nSamples;
                this.sampleRate = wavInfo.sampleRate;
                this.duration = (this.nSamples / this.sampleRate).toFixed(2);
                this.fileSize = wavInfo.metadata.size;
                this.dateModified = formatDate(
                    wavInfo.metadata.modificationTime
                );
                console.log('METADATA:');
                console.log(typeof wavInfo.metadata);
                console.dir(wavInfo.metadata);
            },
            (err: any) => {
                throw(err);
            }
        );

        this.footerButtons = [
            {
                text: 'Rename',
                leftIcon: 'create',
                clickCB: () => { this.onClickRenameButton(); }
            },
            {
                text: 'Move',
                leftIcon: 'share-alt',
                rightIcon: 'directory',
                clickCB: () => { this.onClickMoveButton(); }
            },
            {
                text: 'Delete',
                leftIcon: 'trash',
                clickCB: () => { this.onClickDeleteButton(); }
            },
            {
                text: 'Share',
                leftIcon: 'md-share',
                clickCB: () => { this.onClickShareButton(); }
            }
        ];
    }

    /**
     * UI callback handling 'rename' button click
     */
    public onClickStatsButton(): void {
        console.log('onClickStatsButton()');
    }

    /**
     * UI callback handling 'rename' button click
     */
    public onClickRenameButton(): void {
        console.log('onClickRenameButton()');
    }

    /**
     * UI callback handling 'move' button click
     */
    public onClickMoveButton(): void {
        console.log('onClickMoveButton()');
    }

    /**
     * UI callback handling 'delete' button click
     */
    public onClickDeleteButton(): void {
        console.log('onClickDeleteButton()');
    }

    /**
     * UI callback handling 'share' button click
     */
    private presentActionSheet(): void {
        this.actionSheetController.create({
            title: 'Share as',
            buttons: [
                {
                    text: 'Local file on device',
                    handler: () => {
                        console.log('Share as local file clicked, fname: ');
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                }
            ]
        }).present();
    }

    /**
     * UI callback handling 'share' button click
     */
    public onClickShareButton(): void {
        console.log('onClickShareButton()');
        this.presentActionSheet();
    }

    public ionViewDidLeave(): void {
        console.log('ionViewDidLeave()');
        this.player.stopMonitoring();
    }

}
