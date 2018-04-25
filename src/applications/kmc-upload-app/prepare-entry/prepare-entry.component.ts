import {Component, ViewChild} from '@angular/core';
import {KalturaMediaType} from 'kaltura-ngx-client/api/types/KalturaMediaType';
import {Router} from '@angular/router';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {DraftEntry, PrepareEntryService} from './prepare-entry.service';
import {BrowserService} from 'app-shared/kmc-shell';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions/kmc-permissions.service';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

@Component({
  selector: 'kPrepareEntry',
  templateUrl: './prepare-entry.component.html',
  styleUrls: ['./prepare-entry.component.scss'],
  providers: [
      PrepareEntryService,
      KalturaLogger.createLogger('PrepareEntryComponent')
  ]
})
export class PrepareEntryComponent {
  public _selectedMediaType: KalturaMediaType;
  @ViewChild('transcodingProfileSelectMenu') transcodingProfileSelectMenu: PopupWidgetComponent;

  constructor(private _prepareEntryService: PrepareEntryService,
              private _router: Router,
              private _logger: KalturaLogger,
              private _permissionsService: KMCPermissionsService,
              private _browserService: BrowserService) {
  }

  public prepareEntry(kalturaMediaType: KalturaMediaType) {
      this._logger.info(`handle prepareEntry action by user`, { mediaType: kalturaMediaType });
    this._selectedMediaType = kalturaMediaType;
    const transcodingProfileSettingPermission = this._permissionsService.hasPermission(KMCPermissions.FEATURE_DRAFT_ENTRY_CONV_PROF_SELECTION);
    if (transcodingProfileSettingPermission) {
        this._logger.info(`user has transcoding profile selection permission, open transcoding profile selection dialog`);
      this.transcodingProfileSelectMenu.open();
    } else {
        this._loadEntry({profileId: null});
    }
  }


  public _loadEntry(selectedProfile: { profileId?: number }) {
      this._logger.info(`handle create draft entry action by user`, { transcodingProfileId: selectedProfile.profileId });

    /// passing profileId null will cause to create with default profileId
    this._prepareEntryService.createDraftEntry(this._selectedMediaType, selectedProfile.profileId)
        .tag('block-shell')
      .subscribe((draftEntry: DraftEntry) => {
          this._logger.info(`handle successful draft creation action, redirect to new entry`, { entryId: draftEntry.id });
          this._router.navigate(['/content/entries/entry', draftEntry.id], {queryParams: {reloadEntriesListOnNavigateOut: true}});
          this.transcodingProfileSelectMenu.close();
        },
        error => {
          this._logger.warn(`handle failed draft creation action, show alert`);
          this._browserService.alert({
            message: error.message,
              accept: () => {
                this._logger.info(`user dismissed alert`);
              }
          });
        });
  }
}
