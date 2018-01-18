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
}

