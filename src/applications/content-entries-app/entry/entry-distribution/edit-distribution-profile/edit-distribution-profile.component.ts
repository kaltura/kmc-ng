import { Component, Input } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { Flavor } from '../../entry-flavours/flavor';
import { KalturaDistributionProfile } from 'kaltura-ngx-client/api/types/KalturaDistributionProfile';
import { ExtendedKalturaEntryDistribution } from '../entry-distribution-widget.service';
import { KalturaBaseEntry } from 'kaltura-ngx-client/api/types/KalturaBaseEntry';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';

@Component({
  selector: 'kEditDistributionProfile',
  templateUrl: './edit-distribution-profile.component.html',
  styleUrls: ['./edit-distribution-profile.component.scss']
})
export class EditDistributionProfileComponent {
  @Input() parentPopup: PopupWidgetComponent;
  @Input() distribute = true;
  @Input() profile: KalturaDistributionProfile | ExtendedKalturaEntryDistribution;
  @Input() flavors: Flavor[] = [];
  @Input() entry: KalturaBaseEntry;

  public get _addButtonLabel(): string {
    return this.distribute
      ? this._appLocalization.get('applications.content.entryDetails.distribution.export')
      : this._appLocalization.get('applications.content.entryDetails.distribution.update');
  }

  constructor(private _appLocalization: AppLocalization) {

  }

  public _getEntryTags(entry: KalturaMediaEntry): string[] {
    return (entry && entry.tags) ? entry.tags.split(',').map(item => item.trim()) : null;
  }
}

