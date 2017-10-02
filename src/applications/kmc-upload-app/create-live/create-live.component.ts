import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CreateLiveService, KalturaLive, ManualLive, UniversalLive} from './create-live.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {KalturaRecordStatus} from 'kaltura-typescript-client/types/KalturaRecordStatus';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {BrowserService} from 'app-shared/kmc-shell';
import {Router} from '@angular/router';
import {PopupWidgetComponent} from "@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component";

enum StreamTypes {
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
export class CreateLiveComponent implements OnInit, OnDestroy {
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
  public _blockerState: { isBusy: boolean, message: AreaBlockerMessage } = {isBusy: false, message: null};

  @ViewChild('kalturaLiveStreamComponent') kalturaLiveStreamComponent;
  @ViewChild('manualLiveComponent') manualLiveComponent;
  @ViewChild('universalLiveComponent') universalLiveComponent;
  @Input() parentPopupWidget: PopupWidgetComponent;

  constructor(private createLiveService: CreateLiveService,
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
        // todo: might need to add error message for trying to submit unsupported form type
        break;
      }
    }
  }


  private goToEntryConfirmation(id) {
    this._browserService.confirm(
      {
        header: this._appLocalization.get('applications.upload.prepareLive.goToEntryConfirmation.title'),
        message: this._appLocalization.get('applications.upload.prepareLive.goToEntryConfirmation.message'),
        //        accept:  this._appLocalization.get('app.common.yes'),
        // reject:  this._appLocalization.get('app.common.no'),
        accept: () => {
          this._router.navigate(['/content/entries/entry', id]);
          this.parentPopupWidget.close();
        }
      }
    );
  }


  private _submitKalturaLiveStreamData() {
    if (this.kalturaLiveStreamComponent.validate()) {
      this._updateAreaBlockerState(true, null);

      this.createLiveService.createKalturaLiveStream(this.kalturaLiveStreamData)
        .cancelOnDestroy(this)
        .subscribe(response => {
          this._updateAreaBlockerState(false, null);
          this.goToEntryConfirmation(response.id);
          // todo:
          // show  the server returns the new KalturaLiveStreamEntry object. Display a localized question to the user:
          // title: Stream has been created successfully.
          // message: Live Stream Entry has been created successfully.\nDo you want to view entry details?
          // If the user selects "No" - stay in current page.
          // If the user selects "Yes" - navigate to the new entry page by its ID.
          // All section leaving validations should apply (verify navigation if there is unsaved data).
        }, error => {
          this._updateAreaBlockerState(false, error.message)
        });
    }
  }

  private _submitUniversalLiveStreamData() {
    if (this.universalLiveComponent.validate()) {
      this._updateAreaBlockerState(true, null);

      this.createLiveService.createUniversalLiveStream(this.universalLiveData)
        .cancelOnDestroy(this)
        .subscribe(response => {
          this._updateAreaBlockerState(false, null);
          this.goToEntryConfirmation(response.id);
          // todo:
          // show  the server returns the new KalturaLiveStreamEntry object. Display a localized question to the user:
          // title: Stream has been created successfully.
          // message: Live Stream Entry has been created successfully.\nDo you want to view entry details?
          // If the user selects "No" - stay in current page.
          // If the user selects "Yes" - navigate to the new entry page by its ID.
          // All section leaving validations should apply (verify navigation if there is unsaved data).
        }, error => {
          this._updateAreaBlockerState(false, error.message)
        });
    }
  }

  private _submitManualLiveStreamData() {
    if (this.manualLiveComponent.validate()) {
      this._updateAreaBlockerState(true, null);

      this.createLiveService.createManualLiveStream(this.manualLiveData)
        .cancelOnDestroy(this)
        .subscribe(response => {
          this._updateAreaBlockerState(false, null);
          this.goToEntryConfirmation(response.id);

          // todo:
          // show  the server returns the new KalturaLiveStreamEntry object. Display a localized question to the user:
          // title: Stream has been created successfully.
          // message: Live Stream Entry has been created successfully.\nDo you want to view entry details?
          // If the user selects "No" - stay in current page.
          // If the user selects "Yes" - navigate to the new entry page by its ID.
          // All section leaving validations should apply (verify navigation if there is unsaved data).
        }, error => {
          this._updateAreaBlockerState(false, error.message)
        });
    }
  }

  private _updateAreaBlockerState(isBusy: boolean, message: AreaBlockerMessage): void {
    this._blockerState.isBusy = isBusy;
    this._blockerState.message = message;
  }
}
