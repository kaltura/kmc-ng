import {Component, OnInit, ViewChild} from '@angular/core';
import {KalturaMediaType} from 'kaltura-ngx-client/api/types/KalturaMediaType';
import {Router} from '@angular/router';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {DraftEntry, PrepareEntryService} from './prepare-entry.service';
import {BrowserService} from 'app-shared/kmc-shell';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';

@Component({
  selector: 'kPrepareEntry',
  templateUrl: './prepare-entry.component.html',
  styleUrls: ['./prepare-entry.component.scss'],
  providers: [PrepareEntryService]
})
export class PrepareEntryComponent implements OnInit {
  public _selectedMediaType: KalturaMediaType;
  @ViewChild('transcodingProfileSelectMenu') transcodingProfileSelectMenu: PopupWidgetComponent;

  constructor(private _prepareEntryService: PrepareEntryService,
              private _router: Router,
              private _browserService: BrowserService) {
  }

  ngOnInit() {
  }

  public prepareEntry(kalturaMediaType: KalturaMediaType) {
    this._selectedMediaType = kalturaMediaType;
    // TODO [kmcng] If user permissions allows setting transcoding profile - show transcoding profile selector
    // 'transcodingProfileSettingPermission' should contain whether the user has the permission to set the transcoding profile
    const transcodingProfileSettingPermission = true;
    if (transcodingProfileSettingPermission) {
      this.transcodingProfileSelectMenu.open();
    } else {
        this._loadEntry({profileId: null})
    }
  }


  private _loadEntry(selectedProfile: { profileId?: number }) {

    /// passing profileId null will cause to create with default profileId
    this._prepareEntryService.createDraftEntry(this._selectedMediaType, selectedProfile.profileId)
        .tag('block-shell')
      .subscribe((draftEntry: DraftEntry) => {
          this._router.navigate(['/content/entries/entry', draftEntry.id], {queryParams: {reloadEntriesListOnNavigateOut: true}});
          this.transcodingProfileSelectMenu.close();
        },
        error => {
          this._browserService.setAppStatus({
            errorMessage: error.message
          });
        });
  }
}
