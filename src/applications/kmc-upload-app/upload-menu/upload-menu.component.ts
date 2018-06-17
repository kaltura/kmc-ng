import {Component, EventEmitter, Output} from '@angular/core';
import {BrowserService} from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { subApplicationsConfig } from 'config/sub-applications';
import { serverConfig } from 'config/server';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';

@Component({
  selector: 'kKMCUploadMenu',
  templateUrl: './upload-menu.component.html',
  styleUrls: ['./upload-menu.component.scss']
})
export class UploadMenuComponent {
  @Output() onItemSelected = new EventEmitter<string>();

  public _kmcPermissions = KMCPermissions;
  public _showHighSpeedLink: boolean;
  public _enableHighSpeedLink: boolean;
  public _showNeedHighSpeedLink: boolean;
  public _enableNeedHighSpeedLink: boolean;
  public _enableBulkUploadSamples: boolean;

  constructor(private _browserService: BrowserService,
              private _permissionsService: KMCPermissionsService,
              private _appLocalization: AppLocalization) {
      this._showHighSpeedLink = this._permissionsService.hasPermission(KMCPermissions.FEATURE_SHOW_ASPERA_UPLOAD_BUTTON);
      this._enableHighSpeedLink =  !!serverConfig.externalLinks.uploads && !!serverConfig.externalLinks.uploads.highSpeedUpload;
      this._showNeedHighSpeedLink = !!serverConfig.externalLinks.uploads && !this._showHighSpeedLink && !this._permissionsService.hasPermission(KMCPermissions.FEATURE_HIDE_ASPERA_LINK);
      this._enableNeedHighSpeedLink = !!serverConfig.externalLinks.uploads && !!serverConfig.externalLinks.uploads.needHighSpeedUpload;
      this._enableBulkUploadSamples = !!serverConfig.externalLinks.uploads && !!serverConfig.externalLinks.uploads.bulkUploadSamples;
  }

  onHighSpeedLinkClicked() {
    this._browserService.openLink(serverConfig.externalLinks.uploads.highSpeedUpload);
  }

    onNeedHighSpeedLinkClicked() {
        this._browserService.openLink(serverConfig.externalLinks.uploads.needHighSpeedUpload);
    }

  onDownloadSamplesClicked() {
    this._browserService.openLink(serverConfig.externalLinks.uploads.bulkUploadSamples);
  }

}
