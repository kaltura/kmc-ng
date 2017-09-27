import {Component, EventEmitter, Output, ViewChild} from '@angular/core';
import {BrowserService} from 'app-shared/kmc-shell';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {environment} from 'app-environment';
import {DraftEntry, UploadMenuService} from './upload-menu.service';
import {KalturaMediaType} from 'kaltura-typescript-client/types/KalturaMediaType';
import {Router} from '@angular/router';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

@Component({
  selector: 'kKMCUploadMenu',
  templateUrl: './upload-menu.component.html',
  styleUrls: ['./upload-menu.component.scss']
})
export class UploadMenuComponent {
  @Output() onItemSelected = new EventEmitter<string>();
  @ViewChild('transcodingProfileSelectMenu') public transcodingProfileSelectMenu: PopupWidgetComponent;

  private _selectedMediaType: KalturaMediaType;

  // todo: remove
  @Output() onSubmenuOpened = new EventEmitter();

  constructor(private _browserService: BrowserService,
              private _uploadMenuService: UploadMenuService,
              private _router: Router,
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
    this._browserService.openLink(environment.core.externalLinks.HIGH_SPEED_UPLOAD);
  }

  onDownloadSamplesClicked() {
    this._browserService.openLink(environment.core.externalLinks.BULK_UPLOAD_SAMPLES);
  }

  private _prepareEntry(mediaType: KalturaMediaType) {
    this._selectedMediaType = mediaType;
    if (true) {
      this.transcodingProfileSelectMenu.open();
      this.onSubmenuOpened.emit();
    } else {
      // this._loadEntry({profileId: -1});
    }
  }


  private _loadEntry(selectedProfile: { profileId: number }) {
    this._uploadMenuService.createDraftEntry(this._selectedMediaType,
      selectedProfile.profileId || -1)
      .subscribe((draftEntry: DraftEntry) => {
          this._router.navigate(['/content/entries/entry', draftEntry.id]);
          this.transcodingProfileSelectMenu.close();
        },
        error => {
          // const blockerMessage = new AreaBlockerMessage(
          //   {
          //     message: this._appLocalization.get('applications.settings.accountUpgrade.errors.sendFailed'),
          //     buttons: [
          //       {
          //         label: this._appLocalization.get('app.common.ok'),
          //         action: () => {
          //           this._updateAreaBlockerState(false, null);
          //         }
          //       }
          //     ]
          //   }
          // );
          // this._updateAreaBlockerState(false, blockerMessage);
        });
  }
}
