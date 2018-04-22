import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {KeditHosterConfig} from 'app-shared/kmc-shared/kedit-hoster/kedit-hoster.component';
import {serverConfig} from 'config/server';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {BrowserService} from 'app-shared/kmc-shell';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {KMCPermissions, KMCPermissionsService} from "app-shared/kmc-shared/kmc-permissions";

@Component({
  selector: 'kAdvertisements',
  templateUrl: './advertisements.component.html',
  styleUrls: ['./advertisements.component.scss']
})
export class AdvertisementsComponent implements OnInit, OnDestroy {

  @Input()
  entryId: string = null;

  @Input() parentPopupWidget: PopupWidgetComponent;

  public _keditConfig: KeditHosterConfig;

  private _confirmClose = false;

  constructor(private _logger: KalturaLogger,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization,
              private _permissionService: KMCPermissionsService) {
  }

  ngOnInit() {
    if (!this.entryId) {
      this._logger.warn(`error occurred while trying to initialize AdvertisementsComponent, Please provide entry ID`);
      return undefined;
    }

    const permissions: string[] = ['FEATURE_ALLOW_VAST_CUE_POINT_NO_URL', 'CUEPOINT_MANAGE', 'FEATURE_DISABLE_KMC_KDP_ALERTS']
      .filter(permission => this._permissionService.hasAnyPermissions([KMCPermissions[permission]]));

    this._keditConfig = {
      entryId: this.entryId,
      keditUrl: serverConfig.externalApps.advertisements.uri,
      tab: {
        name: 'advertisements',
        permissions,
        userPermissions: []
      },
      callbackActions: {
        advertisementsModified: this._advertisementsModified.bind(this),
        advertisementsSaved: this._advertisementsSaved.bind(this)
      }
    };
  }

  ngOnDestroy() {
  }

  public _close(): void {
    if (this._confirmClose) {
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.entryDetails.advertisements.cancelEdit'),
          message: this._appLocalization.get('applications.content.entryDetails.advertisements.discard'),
          accept: () => {
            this._confirmClose = false;
            if (this.parentPopupWidget) {
              this.parentPopupWidget.close();
            }
          },
          reject: () => {
          }
        }
      );
    } else {
      if (this.parentPopupWidget) {
        this.parentPopupWidget.close();
      }
    }
  }

  private _advertisementsModified(data: { entryId: string }) {
    if (data && data.entryId === this.entryId) {
      this._confirmClose = true;
    }
  }

  private _advertisementsSaved(data: { entryId: string }) {
    if (data && data.entryId === this.entryId) {
      this._confirmClose = false;
    }
  }
}
