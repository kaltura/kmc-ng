import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { Flavor } from '../../flavor';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization/app-localization.service';
import { KalturaEntryStatus } from 'kaltura-ngx-client/api/types/KalturaEntryStatus';
import { KalturaMediaType } from 'kaltura-ngx-client/api/types/KalturaMediaType';

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

    public _replaceType: UploadMenuType;
    public _uploadEnabled = false;
    public _importEnabled = false;
    public _linkEnabled = false;
    public _replaceButtonsLabel = '';

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
        if (this.entry) {
            if (this.entry.status === KalturaEntryStatus.noContent) {
                this._replaceButtonsLabel = this.entry.mediaType === KalturaMediaType.audio
                    ? this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.addAudio')
                    : this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.addVideo');
            } else {
                this._replaceButtonsLabel = this.entry.mediaType === KalturaMediaType.audio
                    ? this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.replaceAudio')
                    : this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.replaceVideo');
            }
        }
    }

    public _openReplacementMenu(type: UploadMenuType): void {
        this._logger.info(`handle open replacement menu action by user`, { type });
        this._replaceType = type;
        this._uploadMenu.open();
    }
}

