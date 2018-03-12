import { Component, ViewChild } from '@angular/core';
import { KalturaConversionProfileType } from 'kaltura-ngx-client/api/types/KalturaConversionProfileType';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui/area-blocker/area-blocker-message';

@Component({
  selector: 'k-transcoding-profiles-lists-holder',
  templateUrl: './transcoding-profiles-lists-holder.component.html',
  styleUrls: ['./transcoding-profiles-lists-holder.component.scss'],
})
export class TranscodingProfilesListsHolderComponent {
  @ViewChild('addNewProfile') _addNewProfilePopup: PopupWidgetComponent;

  public _kalturaConversionProfileType = KalturaConversionProfileType;
  public _blockerMessage: AreaBlockerMessage;
  public _newProfileType: KalturaConversionProfileType;

  public _setBlockerMessage(message: AreaBlockerMessage): void {
    this._blockerMessage = message;
  }

  public _addProfile(profileType: KalturaConversionProfileType): void {
    this._newProfileType = profileType;
    this._addNewProfilePopup.open();
  }
}
