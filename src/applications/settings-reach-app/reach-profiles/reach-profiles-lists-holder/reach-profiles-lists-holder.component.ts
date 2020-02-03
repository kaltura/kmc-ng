import { Component, ViewChild } from '@angular/core';
import { KalturaConversionProfileType } from 'kaltura-ngx-client';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { SettingsReachMainViewService } from 'app-shared/kmc-shared/kmc-views';
import { BrowserService } from 'shared/kmc-shell/providers/browser.service';

@Component({
  selector: 'k-reach-profiles-lists-holder',
  templateUrl: './reach-profiles-lists-holder.component.html',
  styleUrls: ['./reach-profiles-lists-holder.component.scss'],
  providers: [KalturaLogger.createLogger('ReachProfilesListsHolderComponent')]
})
export class ReachProfilesListsHolderComponent {
  
  public _blockerMessage: AreaBlockerMessage;
  public _kmcPermissions = KMCPermissions;

  constructor(private _logger: KalturaLogger, browserService: BrowserService, settingsReachgMainView: SettingsReachMainViewService) {
        settingsReachgMainView.viewEntered();
  }

  public _setBlockerMessage(message: AreaBlockerMessage): void {
    this._blockerMessage = message;
  }
  
}
