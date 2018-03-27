import {Component, EventEmitter, Output} from '@angular/core';
import {BrowserService} from 'app-shared/kmc-shell';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import { subApplicationsConfig } from 'config/sub-applications';
import { serverConfig } from 'config/server';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';

@Component({
  selector: 'kKMCUploadMenu',
  templateUrl: './upload-menu.component.html',
  styleUrls: ['./upload-menu.component.scss']
})
export class UploadMenuComponent {
  @Output() onItemSelected = new EventEmitter<string>();

  public _kmcPermissions = KMCPermissions;

  constructor(private _browserService: BrowserService,
              private _appLocalization: AppLocalization) {
  }

  // TODO remove when all menu items will be implemented
  public _inDevelopment(): void {
    this._browserService.alert({
      header: this._appLocalization.get('applications.upload.inDevelopment.title'),
      message: this._appLocalization.get('applications.upload.inDevelopment.message')
    });
  }

  onHighSpeedLinkClicked() {
    this._browserService.openLink(serverConfig.externalLinks.uploads.highSpeedUpload);
  }

  onDownloadSamplesClicked() {
    this._browserService.openLink(serverConfig.externalLinks.uploads.bulkUploadSamples);
  }

}
