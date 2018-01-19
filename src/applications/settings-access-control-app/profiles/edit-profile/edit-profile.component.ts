import { Component, Input } from '@angular/core';
import { KalturaAccessControl } from 'kaltura-ngx-client/api/types/KalturaAccessControl';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

@Component({
  selector: 'kAccessControlProfilesEditProfile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent {
  @Input() parentPopup: PopupWidgetComponent;

  @Input() set profile(value: KalturaAccessControl) {
    if (value) {
      this._profile = value;
      this._headerTitle = this._appLocalization.get('applications.settings.accessControl.editAccessControlProfile');
    } else {
      this._headerTitle = this._appLocalization.get('applications.settings.accessControl.addAccessControlProfile');
    }
  }

  private _profile: KalturaAccessControl = null;
  private _headerTitle: string;

  constructor(private _appLocalization: AppLocalization) {

  }

  public _save(): void {

  }

  public _validateDomain(item: string): boolean {
    return /^([a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+.*)$/.test(item);
  }

  public _validateIp(item: string): boolean {
    const ipRegExp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (typeof item === 'string') {
      const cidrOrMask = item.split('/');
      if (cidrOrMask.length === 2) { // x.x.x.x/x or x.x.x.x/m.m.m.m
        return ipRegExp.test(cidrOrMask[0]) && (ipRegExp.test(cidrOrMask[1]) || /^\d+$/.test(cidrOrMask[1]));
      }

      const range = item.split('-');
      if (range.length === 2) { // x.x.x.x-x.x.x.x
        return ipRegExp.test(range[0]) && (ipRegExp.test(range[1]));
      }

      return ipRegExp.test(item); // x.x.x.x
    }


    return false;
  }
}

