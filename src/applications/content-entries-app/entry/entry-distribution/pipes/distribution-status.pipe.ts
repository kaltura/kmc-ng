import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization';
import { KalturaEntryDistribution } from 'kaltura-ngx-client/api/types/KalturaEntryDistribution';
import { KalturaEntryDistributionStatus } from 'kaltura-ngx-client/api/types/KalturaEntryDistributionStatus';
import { KalturaEntryDistributionFlag } from 'kaltura-ngx-client/api/types/KalturaEntryDistributionFlag';

@Pipe({ name: 'kEntriesDistributionStatus' })
export class DistributionStatusPipe implements PipeTransform {
  constructor(private _appLocalization: AppLocalization) {

  }

  transform(profile: KalturaEntryDistribution, type: 'icon' | 'label'): string {
    const result = {
      icon: '',
      label: ''
    };

    if (!profile) {
      return '';
    }

    switch (profile.status) {
      case KalturaEntryDistributionStatus.pending:
        if (!profile.validationErrors || profile.validationErrors.length === 0) {
          result.label = this._appLocalization.get('applications.content.entryDetails.distribution.status.readyForDistribution');
          result.icon = 'kIconinactive';
        } else if (profile.dirtyStatus === KalturaEntryDistributionFlag.submitRequired) {
          result.label = this._appLocalization.get('applications.content.entryDetails.distribution.status.scheduledForDistribution');
          result.icon = 'kIconscheduled';
        } else if (profile.validationErrors && profile.validationErrors.length) {
          result.label = this._appLocalization.get('applications.content.entryDetails.distribution.status.exportFailed');
          result.icon = 'kIconerror';
        }
        break;

      case KalturaEntryDistributionStatus.queued:
        result.label = this._appLocalization.get('applications.content.entryDetails.distribution.status.queued');
        result.icon = 'kIconupload2';
        break;

      case KalturaEntryDistributionStatus.ready:
        if (profile.dirtyStatus === KalturaEntryDistributionFlag.updateRequired) {
          result.label = this._appLocalization.get('applications.content.entryDetails.distribution.status.readyUpdateRequired');
        } else {
          result.label = this._appLocalization.get('applications.content.entryDetails.distribution.status.ready');
        }
        result.icon = 'kIconcomplete';
        break;

      case KalturaEntryDistributionStatus.deleted:
        result.label = this._appLocalization.get('applications.content.entryDetails.distribution.status.deleted');
        result.icon = 'kIconinactive';
        break;

      case KalturaEntryDistributionStatus.submitting:
      case KalturaEntryDistributionStatus.importSubmitting:
        result.label = this._appLocalization.get('applications.content.entryDetails.distribution.status.submitting');
        result.icon = 'kIconsync';
        break;

      case KalturaEntryDistributionStatus.updating:
      case KalturaEntryDistributionStatus.importUpdating:
        result.label = this._appLocalization.get('applications.content.entryDetails.distribution.status.updating');
        result.icon = 'kIconsync';
        break;

      case KalturaEntryDistributionStatus.deleting:
        result.label = this._appLocalization.get('applications.content.entryDetails.distribution.status.deleting');
        result.icon = 'kIconsync';
        break;

      case KalturaEntryDistributionStatus.errorSubmitting:
      case KalturaEntryDistributionStatus.errorUpdating:
        result.label = this._appLocalization.get('applications.content.entryDetails.distribution.status.errorSubmitting');
        result.icon = 'kIconerror';
        break;

      case KalturaEntryDistributionStatus.errorDeleting:
        result.label = this._appLocalization.get('applications.content.entryDetails.distribution.status.errorDeleting');
        result.icon = 'kIconerror';
        break;

      case KalturaEntryDistributionStatus.removed:
        result.label = this._appLocalization.get('applications.content.entryDetails.distribution.status.removed');
        result.icon = 'kIconinactive';
        break;

      default:
        break;
    }

    return type === 'icon' ? result.icon : result.label;
  }
}
