import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { KalturaMediaEntry, KalturaMediaType } from 'kaltura-ngx-client';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { Flavor } from '../../flavor';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { UploadReplacementFile } from '../replace-file/replace-file.component';
import { FileDialogComponent } from '@kaltura-ng/kaltura-ui';

export type UploadMenuType = 'upload' | 'import' | 'link' | 'match';

@Component({
    selector: 'kFlavorReplaceMediaBtn',
    templateUrl: './replace-media-button.component.html',
    styleUrls: ['./replace-media-button.component.scss'],
    providers: [KalturaLogger.createLogger('ReplaceMediaButtonComponent')]
})
export class ReplaceMediaButtonComponent implements OnInit {
    @Input() entry: KalturaMediaEntry;
    @Input() flavors: Flavor[] = [];

    @ViewChild('uploadMenu') _uploadMenu: PopupWidgetComponent;
    @ViewChild('fileDialog') _fileDialog: FileDialogComponent;

    public _replaceType: UploadMenuType;
    public _uploadEnabled = false;
    public _importEnabled = false;
    public _linkEnabled = false;
    public _files: UploadReplacementFile[] = [];
    public _kmcPermissions = KMCPermissions;

    public _allowedVideoExtensions = `.flv,.asf,.qt,.mov,.mpg,.avi,.wmv,.mp4,.3gp,.f4v,.m4v`;
    public _allowedAudioExtensions = `.flv,.asf,.qt,.mov,.mpg,.avi,.wmv,.mp3,.wav`;

    public _allowedExtensions: string;

    constructor(private _appLocalization: AppLocalization,
                private _logger: KalturaLogger,
                private _permissionsService: KMCPermissionsService) {
        this._uploadEnabled = this._permissionsService.hasPermission(KMCPermissions.CONTENT_INGEST_UPLOAD)
            && this._permissionsService.hasPermission(KMCPermissions.CONTENT_INGEST_BASE);
        this._importEnabled = this._permissionsService.hasPermission(KMCPermissions.CONTENT_INGEST_BULK_UPLOAD)
            && this._permissionsService.hasPermission(KMCPermissions.CONTENT_INGEST_BASE);
        this._linkEnabled = this._permissionsService.hasPermission(KMCPermissions.FEATURE_REMOTE_STORAGE_INGEST)
            && this._permissionsService.hasPermission(KMCPermissions.CONTENT_INGEST_REMOTE_STORAGE)
            && this._permissionsService.hasPermission(KMCPermissions.CONTENT_INGEST_BASE);
    }

    ngOnInit() {
        if (!this.entry) {
            this._logger.info(`No entry provided, abort initialization`);
            return;
        }

        if (this.entry.mediaType === KalturaMediaType.video) {
            this._allowedExtensions = this._allowedVideoExtensions;
        } else if (this.entry.mediaType === KalturaMediaType.audio) {
            this._allowedExtensions = this._allowedAudioExtensions;
        }
    }

    public _openReplacementMenu(type: UploadMenuType): void {
        this._logger.info(`handle open replacement menu action by user`, { type });
        this._replaceType = type;
        this._uploadMenu.open();
    }

    public _handleSelectedFiles(files: FileList): void {
        const newItems = Array.from(files).map(file => {
            const { name, size } = file;
            return { file, name, size };
        });

        this._logger.info(`handle file selected action by user`, { fileNames: newItems.map(({ name }) => name) });

        this._files = [...this._files, ...newItems];

        this._replaceType = 'upload';
        this._uploadMenu.open();
    }
}

