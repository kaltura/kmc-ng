import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EntryDistributionWidget, ExtendedKalturaEntryDistribution } from '../entry-distribution-widget.service';
import { KalturaEntryDistributionFlag } from 'kaltura-ngx-client/api/types/KalturaEntryDistributionFlag';
import { KalturaEntryDistributionStatus } from 'kaltura-ngx-client/api/types/KalturaEntryDistributionStatus';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { KalturaDistributionProviderType } from 'kaltura-ngx-client/api/types/KalturaDistributionProviderType';

@Component({
  selector: 'kEntryDistributedProfile',
  templateUrl: './distributed-profile.component.html',
  styleUrls: ['./distributed-profile.component.scss']
})
export class DistributedProfileComponent implements OnInit {
  @Input() profile: ExtendedKalturaEntryDistribution | null;

  @Output() onActionSelected = new EventEmitter<{ action: string, payload: any }>();

  public _profile: ExtendedKalturaEntryDistribution;
  public _isModified = false;
  public _actionButtonLabel = '';
  public _actionButtonDisabled = true;
  public _actionButtonHidden = true;
  public _deleteButtonHidden = true;
  public _providerType: KalturaDistributionProviderType = null;

  constructor(private _appLocalization: AppLocalization,
              private _widgetService: EntryDistributionWidget) {

  }

  ngOnInit() {
    this._prepare();
  }

  private _prepare(): void {
    if (this.profile) {
      this._profile = this.profile;
      this._isModified = this._profile.dirtyStatus === KalturaEntryDistributionFlag.updateRequired;
      this._setupActionButton();
      this._setupDeleteButton();
      const distributionProfile = this._widgetService.getPartnerProfileById(this.profile.distributionProfileId);
      this._providerType = distributionProfile ? distributionProfile.providerType : null;
    }
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
      case KalturaEntryDistributionStatus.errorSubmitting:
      case KalturaEntryDistributionStatus.errorUpdating:
        this._actionButtonLabel = this._appLocalization.get('applications.content.entryDetails.distribution.retry');
        this._actionButtonDisabled = false;
        break;
      case KalturaEntryDistributionStatus.submitting:
      case KalturaEntryDistributionStatus.importSubmitting:
      case KalturaEntryDistributionStatus.updating:
      case KalturaEntryDistributionStatus.importUpdating:
      case KalturaEntryDistributionStatus.deleting:
        this._actionButtonLabel = this._appLocalization.get('applications.content.entryDetails.distribution.processing');
        this._actionButtonDisabled = true;
        break;
      case KalturaEntryDistributionStatus.queued:
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
    switch (profile.status) {
      case KalturaEntryDistributionStatus.errorDeleting:
      case KalturaEntryDistributionStatus.errorSubmitting:
      case KalturaEntryDistributionStatus.errorUpdating:
        this.onActionSelected.emit({ action: 'retry', payload: profile.id });
        break;

      case KalturaEntryDistributionStatus.pending:
      case KalturaEntryDistributionStatus.queued:
        this.onActionSelected.emit({ action: 'distribute', payload: profile.id });
        break;

      case KalturaEntryDistributionStatus.ready:
        if (profile.dirtyStatus === KalturaEntryDistributionFlag.updateRequired) {
          this.onActionSelected.emit({ action: 'sendUpdate', payload: profile.id });
        }
        break;

      default:
        break;

    }
  }

  public _openProfile(profile: ExtendedKalturaEntryDistribution): void {
    this.onActionSelected.emit({ action: 'open', payload: profile });
  }

  public _deleteDistribution(profile: ExtendedKalturaEntryDistribution): void {
    this.onActionSelected.emit({ action: 'deleteDistribution', payload: profile });
  }
}

