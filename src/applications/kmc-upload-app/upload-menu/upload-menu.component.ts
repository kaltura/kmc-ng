import {Component, EventEmitter, Output} from '@angular/core';
import {BrowserService} from 'app-shared/kmc-shell';
import { serverConfig } from 'config/server';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

@Component({
  selector: 'kKMCUploadMenu',
  templateUrl: './upload-menu.component.html',
  styleUrls: ['./upload-menu.component.scss'],
    providers: [KalturaLogger.createLogger('UploadMenuComponent')]
})
export class UploadMenuComponent {
  @Output() onItemSelected = new EventEmitter<string>();

  public _kmcPermissions = KMCPermissions;
  public _showHighSpeedLink: boolean;
  public _enableHighSpeedLink: boolean;
  public _showNeedHighSpeedLink: boolean;
  public _enableNeedHighSpeedLink: boolean;

  constructor(private _browserService: BrowserService,
              private _logger: KalturaLogger,
              private _permissionsService: KMCPermissionsService) {
      this._showHighSpeedLink = this._permissionsService.hasPermission(KMCPermissions.FEATURE_SHOW_ASPERA_UPLOAD_BUTTON);
      this._enableHighSpeedLink =  !!serverConfig.externalLinks.uploads.highSpeedUpload;
      this._showNeedHighSpeedLink = !this._showHighSpeedLink && !this._permissionsService.hasPermission(KMCPermissions.FEATURE_HIDE_ASPERA_LINK);
      this._enableNeedHighSpeedLink = !!serverConfig.externalLinks.uploads.needHighSpeedUpload;
  }

  onHighSpeedLinkClicked() {
      this._logger.info(`handle high speed link clicked action by user`);
    this._browserService.openLink(serverConfig.externalLinks.uploads.highSpeedUpload);
  }

    onNeedHighSpeedLinkClicked() {
        this._logger.info(`handle need high speed link clicked action by user`);
        this._browserService.openLink(serverConfig.externalLinks.uploads.needHighSpeedUpload);
    }

  onDownloadSamplesClicked() {
      this._logger.info(`handle download samples action by user`);
    this._browserService.openLink(serverConfig.externalLinks.uploads.bulkUploadSamples);
  }

}
