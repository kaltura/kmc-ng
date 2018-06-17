import { Component, ViewChild } from '@angular/core';
import { KalturaConversionProfileType } from 'kaltura-ngx-client';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { SettingsTranscodingMainViewService } from 'app-shared/kmc-shared/kmc-views';
import { BrowserService } from 'shared/kmc-shell/providers/browser.service';

@Component({
  selector: 'k-transcoding-profiles-lists-holder',
  templateUrl: './transcoding-profiles-lists-holder.component.html',
  styleUrls: ['./transcoding-profiles-lists-holder.component.scss'],
  providers: [KalturaLogger.createLogger('TranscodingProfilesListsHolderComponent')]
})
export class TranscodingProfilesListsHolderComponent {
  @ViewChild('addNewProfile') _addNewProfilePopup: PopupWidgetComponent;

  public _kalturaConversionProfileType = KalturaConversionProfileType;
  public _blockerMessage: AreaBlockerMessage;
  public _newProfileType: KalturaConversionProfileType;
  public _kmcPermissions = KMCPermissions;

  constructor(private _logger: KalturaLogger, browserService: BrowserService, settingsTranscodingMainView: SettingsTranscodingMainViewService) {
        settingsTranscodingMainView.viewEntered();
  }

  public _setBlockerMessage(message: AreaBlockerMessage): void {
    this._blockerMessage = message;
  }

  public _addProfile(profileType: KalturaConversionProfileType): void {
    this._logger.info(`handle 'add' profile action by the user`, { profileType });
    this._newProfileType = profileType;
    this._addNewProfilePopup.open();
  }
}
