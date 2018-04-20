import { Component, Input } from '@angular/core';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { KalturaMediaType } from 'kaltura-ngx-client/api/types/KalturaMediaType';
import { KalturaEntryStatus } from 'kaltura-ngx-client/api/types/KalturaEntryStatus';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';

@Component({
    selector: 'kFlavorReplaceVideoBtn',
    templateUrl: './replace-video-button.component.html',
    styleUrls: ['./replace-video-button.component.scss']
})
export class ReplaceVideoButtonComponent {
    @Input() entry: KalturaMediaEntry;

    public _uploadFileLabel: string;
    public _importFileLabel: string;
    public _kmcPermissions = KMCPermissions;

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
                private _permissionsService: KMCPermissionsService) {
        if (this._permissionsService.hasPermission(KMCPermissions.FEATURE_MULTI_FLAVOR_INGESTION)) {
            this._uploadFileLabel = this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.uploadFiles');
            this._importFileLabel = this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.importFiles');
        } else {
            this._uploadFileLabel = this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.uploadFile');
            this._importFileLabel = this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.importFile');
        }
    }
}

