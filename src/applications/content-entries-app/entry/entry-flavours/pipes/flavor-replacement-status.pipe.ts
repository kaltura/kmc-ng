import { Pipe, PipeTransform } from '@angular/core';
import { KalturaEntryReplacementStatus } from 'kaltura-ngx-client/api/types/KalturaEntryReplacementStatus';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization/app-localization.service';

@Pipe({ name: 'kFlavorReplacementStatus' })
export class FlavorReplacementStatusPipe implements PipeTransform {
    constructor(private _appLocalization: AppLocalization) {

    }

    transform(replacementStatus: KalturaEntryReplacementStatus, type: 'icon' | 'label'): string {
        const result = {
            icon: '',
            label: ''
        };

        if (!replacementStatus) {
            return '';
        }

        switch (replacementStatus) {
            case KalturaEntryReplacementStatus.approvedButNotReady:
            case KalturaEntryReplacementStatus.notReadyAndNotApproved:
                result.label = this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.replacementStatus.replacementInProcess');
                result.icon = 'kIconsync';
                break;
            case KalturaEntryReplacementStatus.readyButNotApproved:
                result.label = this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.replacementStatus.readyForReplacement');
                result.icon = 'kIconcomplete';
                break;
            case KalturaEntryReplacementStatus.failed:
                result.label = this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.replacementStatus.replacementFailed');
                result.icon = 'kIconerror';
                break;
            default:
                break;
        }

        return type === 'icon' ? result.icon : result.label;
    }
}
