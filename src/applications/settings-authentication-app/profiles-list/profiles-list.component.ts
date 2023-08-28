import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AuthProfile, LoadProfilesResponse, ProfilesStoreService } from '../profiles-store/profiles-store.service';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { AppAnalytics, BrowserService } from 'app-shared/kmc-shell/providers';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { AdminRolesMainViewService } from 'app-shared/kmc-shared/kmc-views';

@Component({
  selector: 'kAuthenticationProfilesList',
  templateUrl: './profiles-list.component.html',
  styleUrls: ['./profiles-list.component.scss'],
  providers: [KalturaLogger.createLogger('AuthenticationProfilesListComponent'), ProfilesStoreService]
})

export class ProfilesListComponent implements OnInit, OnDestroy {
  @ViewChild('editPopup', { static: true }) public editPopup: PopupWidgetComponent;

  public _isBusy = false;
  public _profiles: AuthProfile[] = [];
  public _profilesCount = 0;
  public _blockerMessage: AreaBlockerMessage = null;
  public pageSize = 25;
  public pageIndex = 0;
  public orderBy = '-name';

  constructor(public _profilesStore: ProfilesStoreService,
              private _logger: KalturaLogger,
              private _browserService: BrowserService,
              private _adminRolesMainViewService: AdminRolesMainViewService,
              private _appLocalization: AppLocalization,
              private _analytics: AppAnalytics) {
  }

  ngOnInit() {
      if (this._adminRolesMainViewService.viewEntered()) {
          this._loadProfiles(this.pageSize, this.pageIndex, this.orderBy);
      }
  }

  ngOnDestroy() {
  }

  public _loadProfiles(pageSize: number, pageIndex: number, orderBy: string): void {
      this._blockerMessage = null;
      this._isBusy = true;
      this._profilesStore.loadProfiles(pageSize, pageIndex, orderBy).subscribe(
          (response: LoadProfilesResponse) => {
              this._isBusy = false;
              if (response.objects?.length) {
                  this._profiles = response.objects as AuthProfile[];
                  this._profiles.forEach(profile => profile.status = 'incomplete'); // TODO calculate status according to profile fields
              }
              this._profilesCount = response.totalCount;
          },
          error => {
              this._isBusy = false;
              this._blockerMessage = new AreaBlockerMessage({
                  message: this._appLocalization.get('applications.settings.authentication.loadError'),
                  buttons: [
                  {
                      label: this._appLocalization.get('app.common.retry'),
                      action: () => {
                          this._logger.info(`user confirmed, retry action`);
                          this._blockerMessage = null;
                          this._refresh();
                      }
                  },
                  {
                      label: this._appLocalization.get('app.common.cancel'),
                      action: () => {
                          this._logger.info(`user didn't confirm, abort action, dismiss dialog`);
                          this._blockerMessage = null;
                      }
                  }
              ]
              });
          }
      )
  }

  public _refresh(): void {
      this._loadProfiles(this.pageSize, this.pageIndex, this.orderBy);
  }

  public _addProfile(): void {
    this._analytics.trackClickEvent('Add_Authentication_role');
    this._logger.info(`handle add authentication profile action by user`);
    // this._currentEditProfile = null;
    this.editPopup.open();
  }
}
