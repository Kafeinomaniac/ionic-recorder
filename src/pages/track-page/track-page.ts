// Copyright (c) 2017 Tracktunes Inc

import { Component } from '@angular/core';
import {
    ActionSheetController,
    Alert,
    AlertController,
    Modal,
    ModalController,
    NavController,
    NavParams,
    ViewController
} from 'ionic-angular';
import { DEFAULT_PATH, AppFilesystem } from '../../services';
import { ButtonbarButton } from '../../components';
import {
    WAV_MIME_TYPE,
    WavFile,
    WavInfo,
    formatDate,
    pathFileName,
    pathFolderName
} from '../../models';
import { MoveToPage } from '../../pages';

/**
 * @class TrackPage
 */
@Component({
    selector: 'track-page',
    templateUrl: 'track-page.html'
})
export class TrackPage {
    protected navController: NavController;
    private actionSheetController: ActionSheetController;
    private viewController: ViewController;
    private modalController: ModalController;
    public footerButtons: ButtonbarButton[];
    public filePath: string;
    public fileName: string;
    public parentFolder: string;
    public dateModified: string;
    public encoding: string;
    public duration: string;
    public fileSize: number;
    public sampleRate: number;
    public nSamples: number;
    private appFilesystem: AppFilesystem;
    private alertController: AlertController;

    /**
     * @constructor
     * @param {NavParams}
     * @param {ActionSheetController}
     */
    constructor(
        navController: NavController,
        navParams: NavParams,
        appFilesystem: AppFilesystem,
        actionSheetController: ActionSheetController,
        alertController: AlertController,
        viewController: ViewController,
        modalController: ModalController
    ) {
        console.log('constructor(' + navParams.data + ')');
        // grab data sent over from the caller of this page - full path of file
        this.navController = navController;
        this.filePath = navParams.data;
        this.fileName = pathFileName(this.filePath);
        this.parentFolder = pathFolderName(this.filePath);
        this.appFilesystem = appFilesystem;
        this.actionSheetController = actionSheetController;
        this.alertController = alertController;
        this.viewController = viewController;
        this.modalController = modalController;
        this.encoding = WAV_MIME_TYPE;

        WavFile.readWavFileInfo(this.filePath, true).subscribe(
            (wavInfo: WavInfo) => {
                this.nSamples = wavInfo.nSamples;
                this.sampleRate = wavInfo.sampleRate;
                this.duration = (this.nSamples / this.sampleRate).toFixed(2);
                this.fileSize = wavInfo.metadata.size;
                this.dateModified = formatDate(
                    wavInfo.metadata.modificationTime
                );
            },
            (err: any) => {
                throw(err);
            }
        );

        this.footerButtons = [
            {
                text: 'Rename',
                leftIcon: 'md-create',
                clickCB: () => { this.onClickRenameButton(); }
            },
            {
                text: 'Move',
                leftIcon: 'share-alt',
                rightIcon: 'folder',
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
        const renameAlert: Alert = this.alertController.create({
            title: 'Rename file \'' + this.fileName + '\' to:',
            inputs: [{
                name: 'newName',
                placeholder: 'Enter new file name ...'
            }],
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Clicked cancel in rename alert');
                    }
                },
                {
                    text: 'Done',
                    handler: (data: any) => {
                        this.appFilesystem.rename(this.filePath, data.newName)
                            .subscribe(
                                () => {
                                    this.fileName = data.newName;
                                    this.filePath = this.parentFolder +
                                        this.fileName;
                                },
                                (err: any) => {
                                    throw Error(err);
                                }
                            );
                    }
                }
            ]
        });
        renameAlert.present();
    }

    /**
     * UI callback handling 'move' button click
     */
    public onClickMoveButton(): void {
        console.log('onClickMoveButton()');
        // const modal: Modal = this.modalController.create(MoveToPage);
        // modal.present();
        this.navController.push(MoveToPage, this.filePath);
        console.log('after modal.present();');
    }

    /**
     * UI callback handling 'delete' button click
     */
    public onClickDeleteButton(): void {
        console.log('onClickDeleteButton()');
        const deleteAlert: Alert = this.alertController.create();
        deleteAlert.setTitle('Are you sure you want to delete \'' +
                             this.fileName + '\'?');
        deleteAlert.addButton('Cancel');
        deleteAlert.addButton({
            text: 'Yes',
            handler: () => {
                console.log('we are deleting ...');
                const filePath: string = DEFAULT_PATH + this.fileName;
                this.appFilesystem.deletePaths([filePath]).subscribe(
                    () => {
                        console.log('successfully deleted ' + this.fileName);
                        this.viewController.dismiss();
                    },
                    (err: any) => {
                        throw Error(err);
                    }
                );
            }
        });
        deleteAlert.present();
    }

    /**
     * UI callback handling 'share' button click
     */
    private presentShareActionSheet(): void {
        this.actionSheetController.create({
            title: 'Share as',
            buttons: [
                {
                    text: 'Local file on device',
                    handler: () => {
                        console.log('Share as local file clicked, fname: ');
                        this.appFilesystem.downloadFileToDevice(this.filePath)
                            .subscribe();
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
        this.presentShareActionSheet();
    }
}
