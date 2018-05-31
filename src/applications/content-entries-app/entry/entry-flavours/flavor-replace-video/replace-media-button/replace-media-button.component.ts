import { Component, Input, ViewChild } from '@angular/core';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { KalturaMediaType } from 'kaltura-ngx-client/api/types/KalturaMediaType';
import { KalturaEntryStatus } from 'kaltura-ngx-client/api/types/KalturaEntryStatus';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { Flavor } from '../../flavor';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization/app-localization.service';

export type UploadMenuType = 'upload' | 'import' | 'link' | 'match';

@Component({
    selector: 'kFlavorReplaceMediaBtn',
    templateUrl: './replace-media-button.component.html',
    styleUrls: ['./replace-media-button.component.scss'],
    providers: [KalturaLogger.createLogger('ReplaceMediaButtonComponent')]
})
export class ReplaceMediaButtonComponent {
    @Input() entry: KalturaMediaEntry;
    @Input() flavors: Flavor[] = [];

    @ViewChild('uploadMenu') _uploadMenu: PopupWidgetComponent;
    @ViewChild('replaceVideoPopup') _replaceVideoPopup: PopupWidgetComponent;

    public _uploadFileLabel: string;
    public _importFileLabel: string;
    public _replaceType: UploadMenuType;

    public _uploadEnabled = false;
    public _importEnabled = false;
    public _linkEnabled = false;

    public get _actionBtnTitle(): string {
        if (!this.entry) {
            return '';
        }

        if (this.entry.mediaType === KalturaMediaType.video) {
            return this.entry.status === KalturaEntryStatus.noContent
                ? this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.addVideo')
                : this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.replaceVideo');
        } else if (this.entry.mediaType === KalturaMediaType.audio) {
            return this.entry.status === KalturaEntryStatus.noContent
                ? this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.addAudio')
                : this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.replaceAudio');
        }
    }

    constructor(private _appLocalization: AppLocalization,
                private _logger: KalturaLogger,
                private _permissionsService: KMCPermissionsService) {
        if (this._permissionsService.hasPermission(KMCPermissions.FEATURE_MULTI_FLAVOR_INGESTION)) {
            this._uploadFileLabel = this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.uploadFiles');
            this._importFileLabel = this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.importFiles');
        } else {
            this._uploadFileLabel = this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.uploadFile');
            this._importFileLabel = this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.importFile');
        }

        this._uploadEnabled = this._permissionsService.hasPermission(KMCPermissions.CONTENT_INGEST_UPLOAD)
            && this._permissionsService.hasPermission(KMCPermissions.CONTENT_INGEST_BASE);
        this._importEnabled = this._permissionsService.hasPermission(KMCPermissions.CONTENT_INGEST_BULK_UPLOAD)
            && this._permissionsService.hasPermission(KMCPermissions.CONTENT_INGEST_BASE);
        this._linkEnabled = this._permissionsService.hasPermission(KMCPermissions.FEATURE_REMOTE_STORAGE_INGEST)
            && this._permissionsService.hasPermission(KMCPermissions.CONTENT_INGEST_REMOTE_STORAGE)
            && this._permissionsService.hasPermission(KMCPermissions.CONTENT_INGEST_BASE);
    }

    public _openReplacementMenu(type: UploadMenuType): void {
        this._logger.info(`handle open replacement menu action by user`, { type });
        this._replaceType = type;
        this._replaceVideoPopup.close();
        this._uploadMenu.open();
    }
}

