import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EntryDistributionWidget } from './entry-distribution-widget.service';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { KalturaDistributionProfile } from 'kaltura-ngx-client/api/types/KalturaDistributionProfile';


@Component({
  selector: 'kEntryDistribution',
  templateUrl: './entry-distribution.component.html',
  styleUrls: ['./entry-distribution.component.scss']
})
export class EntryDistributionComponent implements OnInit, OnDestroy {
  @ViewChild('editProfile') _editProfilePopup: PopupWidgetComponent;

  public _loading = false;
  public _loadingError = null;
  public _selectedProfile: KalturaDistributionProfile;
  public _distribute = false;

  constructor(public _widgetService: EntryDistributionWidget) {
  }


  ngOnInit() {
    this._widgetService.attachForm();
  }

  ngOnDestroy() {
    this._widgetService.detachForm();
  }

  public _distributeProfile(profile: KalturaDistributionProfile): void {
    this._distribute = true;
    this._selectedProfile = profile;
    this._editProfilePopup.open();
  }
}

