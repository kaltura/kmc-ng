import {Component, OnInit, ViewChild} from '@angular/core';
import {KalturaMediaType} from 'kaltura-typescript-client/types/KalturaMediaType';
import {Router} from '@angular/router';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {DraftEntry, PrepareEntryService} from './prepare-entry.service';
import {BrowserService} from 'app-shared/kmc-shell';

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
    }
  }

  private _loadEntry(selectedProfile: { profileId?: number }) {
    this._browserService.setAppStatus({
      isBusy: true,
      errorMessage: null
    });

    this._prepareEntryService.createDraftEntry(this._selectedMediaType, selectedProfile.profileId)
      .subscribe((draftEntry: DraftEntry) => {
          this._router.navigate(['/content/entries/entry', draftEntry.id], {queryParams: {reloadEntries: true}})
            .then(() => {
              this._browserService.setAppStatus({
                isBusy: false,
                errorMessage: null
              });
            })
            .catch(() => {
              this._browserService.setAppStatus({
                isBusy: false,
                errorMessage: 'error occurred while navigating to entry'
              });
            });
          this.transcodingProfileSelectMenu.close();

        },
        error => {
          this._browserService.setAppStatus({
            isBusy: false,
            errorMessage: 'Failed to create entry'
          });
        });
  }
}
