import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {TranscodingProfilesService} from './transcoding-profiles.service';
import {BrowserService} from 'app-shared/kmc-shell';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {KalturaMediaType} from 'kaltura-ngx-client/api/types/KalturaMediaType';

@Component({
  selector: 'kTranscodingProfileSelect',
  templateUrl: './transcoding-profile-select.component.html',
  styleUrls: ['./transcoding-profile-select.component.scss'],
  providers: [TranscodingProfilesService]
})
export class TranscodingProfileSelectComponent implements OnInit {
  @Output() onTranscodingProfileSelected = new EventEmitter<{ profileId?: number }>();
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() mediaType: KalturaMediaType.video | KalturaMediaType.audio;
  public _title: string;
  public transcodingProfileSelectForm: FormGroup;
  public _profiles: { label: string, value: number }[] = [];
  public _blockerMessage: AreaBlockerMessage = null;
  public _isBusy = false;


  constructor(private _appLocalization: AppLocalization,
              private _fb: FormBuilder,
              private _transcodingProfilesService: TranscodingProfilesService,
              private _browserService: BrowserService) {
  }

  ngOnInit() {
    this._title = this.mediaType === KalturaMediaType.video ?
      this._appLocalization.get('applications.upload.transcodingProfilesSelect.titleVideo') :
      this._appLocalization.get('applications.upload.transcodingProfilesSelect.titleAudio');
    this._updateAreaBlockerState(true, null);
    this._createForm();
    this._loadTranscodingProfiles();
  }

  private _updateAreaBlockerState(isBusy: boolean, message: AreaBlockerMessage): void {
    this._isBusy = isBusy;
    this._blockerMessage = message;
  }

  private _createForm(): void {
    this.transcodingProfileSelectForm = this._fb.group({
      profile: null
    });
  }

  private _loadTranscodingProfiles() {
    this._transcodingProfilesService.getTranscodingProfiles()
      .subscribe(profiles => {
          profiles.forEach(profile => {
            this._profiles.push({label: profile.name, value: profile.id});
          });

          // get profile from local cache if exists
          const cachedSelectedProfile = this._getSelectedTranscodingProfile(profiles);
          this.transcodingProfileSelectForm
            .patchValue({
              profile: cachedSelectedProfile
            });

          this._updateAreaBlockerState(false, null);
        },
        error => {
          const blockerMessage = new AreaBlockerMessage(
            {
              message: this._appLocalization.get('applications.upload.transcodingProfilesSelect.errors.loadFailed'),
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this._loadTranscodingProfiles();
                  }
                }
              ]
            }
          );
          this._updateAreaBlockerState(false, blockerMessage);
        });
  }

  private _getSelectedTranscodingProfile(transcodingProfilesList): number {
    if (!transcodingProfilesList || !transcodingProfilesList.length) {
      return null;
    }

    const profileIdFromCache = this._browserService.getFromLocalStorage('transcodingProfiles.selectedProfile');
    const profileExistsInList = transcodingProfilesList
      .findIndex((profile) => (profile.id === profileIdFromCache)) > -1;

    // if selected profile id exists in the list return it ; else return first option
    if (profileIdFromCache && profileExistsInList) {
      return profileIdFromCache;
    } else {
      this._browserService.setInLocalStorage('transcodingProfiles.selectedProfile', transcodingProfilesList[0].id);
      return transcodingProfilesList[0].id;
    }
  }

  public _saveAndClose() {
    // set profile in local cache
    const selectedProfile = this.transcodingProfileSelectForm.get('profile').value;
    if (selectedProfile) {
      this._browserService.setInLocalStorage('transcodingProfiles.selectedProfile', selectedProfile);
      this.onTranscodingProfileSelected.emit({profileId: selectedProfile});
    }
    this.parentPopupWidget.close();
  }
}
