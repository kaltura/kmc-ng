import { AfterViewInit, Component, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {CreateLiveService} from './create-live.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {KalturaRecordStatus} from 'kaltura-ngx-client/api/types/KalturaRecordStatus';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {BrowserService} from 'app-shared/kmc-shell';
import {Router} from '@angular/router';
import {PopupWidgetComponent, PopupWidgetStates} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {KalturaLive} from './kaltura-live-stream/kaltura-live-stream.interface';
import {ManualLive} from './manual-live/manual-live.interface';
import {UniversalLive} from './universal-live/universal-live.interface';
import { BlockShellTag, TagValue } from 'app-shared/kmc-shell/providers/tags';

export enum StreamTypes {
  kaltura,
  universal,
  manual
}

@Component({
  selector: 'kCreateLive',
  templateUrl: './create-live.component.html',
  styleUrls: ['./create-live.component.scss'],
  providers: [CreateLiveService]
})
export class CreateLiveComponent implements OnInit, OnDestroy, AfterViewInit {
  public _selectedStreamType: StreamTypes = StreamTypes.kaltura;
  public kalturaLiveStreamData: KalturaLive = {
    name: '',
    description: '',
    transcodingProfile: null,
    liveDVR: false,
    enableRecording: false,
    enableRecordingSelectedOption: KalturaRecordStatus.appended,
    previewMode: false
  };
  public manualLiveData: ManualLive = {
    name: '',
    description: '',
    flashHDSURL: '',
    hlsStreamUrl: '',
    useAkamaiHdProtocol: false
  };
  public universalLiveData: UniversalLive = {
    name: '',
    description: '',
    primaryEncoderIp: '',
    secondaryEncoderIp: '',
    broadcastPassword: '',
    liveDvr: false
  };
  public _availableStreamTypes: Array<{ value: StreamTypes, label: string }>;
  public _streamTypes = StreamTypes;
  public _blockerMessage: AreaBlockerMessage;
  private _showConfirmationOnClose = true;

  @ViewChild('kalturaLiveStreamComponent') kalturaLiveStreamComponent;
  @ViewChild('manualLiveComponent') manualLiveComponent;
  @ViewChild('universalLiveComponent') universalLiveComponent;
  @Input() parentPopupWidget: PopupWidgetComponent;

  constructor(@Inject(BlockShellTag) private _blockShell: TagValue,
              private createLiveService: CreateLiveService,
              private _appLocalization: AppLocalization,
              private _browserService: BrowserService,
              private _router: Router) {
  }

  ngOnInit() {
    this._availableStreamTypes = [
      {
        value: StreamTypes.kaltura,
        label: this._appLocalization.get('applications.upload.prepareLive.streamTypes.kaltura')
      },
      {
        value: StreamTypes.manual,
        label: this._appLocalization.get('applications.upload.prepareLive.streamTypes.manual')
      },
      {
        value: StreamTypes.universal,
        label: this._appLocalization.get('applications.upload.prepareLive.streamTypes.universal')
      }
    ];
  }

  ngAfterViewInit() {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.state$
        .cancelOnDestroy(this)
        .subscribe(event => {
          if (event.state === PopupWidgetStates.Open) {
            this._showConfirmationOnClose = true;
          }
          if (event.state === PopupWidgetStates.BeforeClose) {
            if (event.context && event.context.allowClose) {
              if (this._isCurrentSelectedFormDirty() && this._showConfirmationOnClose) {
                event.context.allowClose = false;
                this._browserService.confirm(
                  {
                    header: this._appLocalization.get('applications.content.addNewPlaylist.cancelEdit'),
                    message: this._appLocalization.get('applications.content.addNewPlaylist.discard'),
                    accept: () => {
                      this._showConfirmationOnClose = false;
                      this.parentPopupWidget.close();
                    }
                  }
                );
              }
            }
          }
        });
    }
  }

  ngOnDestroy() {
  }

  submitCurrentSelectedForm() {
    switch (this._selectedStreamType) {
      case StreamTypes.kaltura: {
        this._submitKalturaLiveStreamData();
        break;
      }
      case StreamTypes.universal: {
        this._submitUniversalLiveStreamData();
        break;
      }
      case StreamTypes.manual: {
        this._submitManualLiveStreamData();
        break;
      }
      default: {
        // add error message for trying to submit unsupported form type
        this._blockerMessage = new AreaBlockerMessage({
          title: 'Cannot create stream',
          message: 'Unsupported stream type, please select different stream type from the \'Stream type\' select menu',
          buttons: [{
            label: this._appLocalization.get('app.common.confirm'),
            action: () => {
              this._blockerMessage = null;
            }
          }]
        });
        break;
      }
    }
  }

  private _isCurrentSelectedFormDirty(): boolean {
    switch (this._selectedStreamType) {
      case StreamTypes.kaltura: {
        return this.kalturaLiveStreamComponent.isFormDirty();
      }
      case StreamTypes.universal: {
        return this.universalLiveComponent.isFormDirty();
      }
      case StreamTypes.manual: {
        return this.manualLiveComponent.isFormDirty();
      }
      default: {
        return false;
      }
    }
  }


  private _confirmEntryNavigation(id) {
    this._browserService.confirm(
      {
        header: this._appLocalization.get('applications.upload.prepareLive.confirmEntryNavigation.title'),
        message: this._appLocalization.get('applications.upload.prepareLive.confirmEntryNavigation.message'),
        accept: () => {
          this._router.navigate(['/content/entries/entry', id], {queryParams: {reloadEntriesListOnNavigateOut: true}})
          this._showConfirmationOnClose = false;
          this.parentPopupWidget.close();
        },
        reject: () => {
          this._showConfirmationOnClose = false;
          this.parentPopupWidget.close();
        }
      }
    );
  }


  private _submitKalturaLiveStreamData() {
    if (this.kalturaLiveStreamComponent.validate()) {
      this.createLiveService.createKalturaLiveStream(this.kalturaLiveStreamData)
        .cancelOnDestroy(this)
        .tag(this._blockShell)
        .subscribe(response => {
          this._confirmEntryNavigation(response.id);
        }, error => {
          this._blockerMessage = error.message;
        });
    }
  }

  private _submitUniversalLiveStreamData() {
    if (this.universalLiveComponent.validate()) {
      this.createLiveService.createUniversalLiveStream(this.universalLiveData)
        .cancelOnDestroy(this)
        .tag(this._blockShell)
        .subscribe(response => {
          this._confirmEntryNavigation(response.id);
        }, error => {
          this._blockerMessage = error.message;
        });
    }
  }

  private _submitManualLiveStreamData() {
    if (this.manualLiveComponent.validate()) {
      this.createLiveService.createManualLiveStream(this.manualLiveData)
        .cancelOnDestroy(this)
        .tag(this._blockShell)
        .subscribe(response => {
          this._confirmEntryNavigation(response.id);
        }, error => {
          this._blockerMessage = error.message;
        });
    }
  }
}
