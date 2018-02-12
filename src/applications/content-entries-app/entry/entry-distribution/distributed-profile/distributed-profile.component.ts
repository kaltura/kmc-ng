import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ExtendedKalturaEntryDistribution } from '../entry-distribution-widget.service';
import { KalturaEntryDistributionFlag } from 'kaltura-ngx-client/api/types/KalturaEntryDistributionFlag';
import { KalturaEntryDistributionStatus } from 'kaltura-ngx-client/api/types/KalturaEntryDistributionStatus';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';

@Component({
  selector: 'kEntryDistributedProfile',
  templateUrl: './distributed-profile.component.html',
  styleUrls: ['./distributed-profile.component.scss']
})
export class DistributedProfileComponent {
  @Input() set profile(value: ExtendedKalturaEntryDistribution | null) {
    if (value) {
      this._profile = value;
      this._isModified = this._profile.dirtyStatus === KalturaEntryDistributionFlag.updateRequired;
      this._setupActionButton();
      this._setupDeleteButton();
    }
  }

  @Output() onDeleteDistribution = new EventEmitter<ExtendedKalturaEntryDistribution>();
  @Output() onOpenProfile = new EventEmitter<ExtendedKalturaEntryDistribution>();
  @Output() onSubmitUpdate = new EventEmitter<number>();
  @Output() onDistribute = new EventEmitter<number>();

  public _profile: ExtendedKalturaEntryDistribution;
  public _isModified = false;
  public _actionButtonLabel = '';
  public _actionButtonDisabled = true;
  public _actionButtonHidden = true;
  public _deleteButtonHidden = true;

  constructor(private _appLocalization: AppLocalization) {

  }

  private _setupActionButton(): void {
    const { status, dirtyStatus } = this._profile;
    this._actionButtonHidden = false;

    switch (status) {
      case KalturaEntryDistributionStatus.ready:
        if (dirtyStatus === KalturaEntryDistributionFlag.updateRequired) {
          this._actionButtonLabel = this._appLocalization.get('applications.content.entryDetails.distribution.export');
          this._actionButtonDisabled = false;
        } else {
          this._actionButtonLabel = this._appLocalization.get('applications.content.entryDetails.distribution.upToDate');
          this._actionButtonDisabled = true;
        }
        break;
      case KalturaEntryDistributionStatus.errorDeleting:
        this._actionButtonLabel = this._appLocalization.get('applications.content.entryDetails.distribution.upToDate');
        this._actionButtonDisabled = true;
        break;
      case KalturaEntryDistributionStatus.submitting:
      case KalturaEntryDistributionStatus.importSubmitting:
      case KalturaEntryDistributionStatus.updating:
      case KalturaEntryDistributionStatus.importUpdating:
      case KalturaEntryDistributionStatus.deleting:
        this._actionButtonLabel = this._appLocalization.get('applications.content.entryDetails.distribution.processing');
        this._actionButtonDisabled = true;
        break;
      case KalturaEntryDistributionStatus.errorSubmitting:
      case KalturaEntryDistributionStatus.errorUpdating:
      case KalturaEntryDistributionStatus.pending:
        this._actionButtonLabel = this._appLocalization.get('applications.content.entryDetails.distribution.export');
        this._actionButtonDisabled = false;
        break;
      default:
        this._actionButtonHidden = true;
        break;
    }
  }

  private _setupDeleteButton(): void {
    const enabledStatuses = [
      KalturaEntryDistributionStatus.ready,
      KalturaEntryDistributionStatus.errorUpdating,
      KalturaEntryDistributionStatus.queued,
      KalturaEntryDistributionStatus.pending,
      KalturaEntryDistributionStatus.errorSubmitting
    ];

    this._deleteButtonHidden = enabledStatuses.indexOf(this._profile.status) === -1;
  }

  public _performAction(profile: ExtendedKalturaEntryDistribution): void {
    if (profile.status === KalturaEntryDistributionStatus.errorUpdating || profile.dirtyStatus === KalturaEntryDistributionFlag.updateRequired) {
      this.onSubmitUpdate.emit(profile.id);
    } else if (profile.status === KalturaEntryDistributionStatus.pending
      || profile.status === KalturaEntryDistributionStatus.errorSubmitting
      || profile.status === KalturaEntryDistributionStatus.queued) {
      this.onDistribute.emit(profile.distributionProfileId);
    } else {
      // do nothing
    }
  }
}

