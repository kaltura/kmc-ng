import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CreateLiveService, KalturaLiveStream, ManualLive, UniversalLive} from './create-live.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {KalturaRecordStatus} from 'kaltura-typescript-client/types/KalturaRecordStatus';
import {AreaBlockerMessage} from "@kaltura-ng/kaltura-ui";

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
  public kalturaLiveStreamData: KalturaLiveStream = {
    name: '',
    description: '',
    transcodingProfile: null,
    liveDVR: false,
    enableRecording: false,
    enableRecordingSelectedOption: KalturaRecordStatus.appended,
    previewMode: false
  };
  public manualLiveData: ManualLive;
  public universalLiveData: UniversalLive;
  public _availableStreamTypes: Array<{ value: StreamTypes, label: string }>;
  public _streamTypes = StreamTypes;
  public _blockerState: { isBusy: boolean, message: AreaBlockerMessage } = {isBusy: false, message: null};

  @ViewChild('kalturaLiveStreamComponent') kalturaLiveStreamComponent;
  @ViewChild('manualLiveComponent') manualLiveComponent;
  @ViewChild('universalLiveData') universalLiveComponent;

  constructor(private createLiveService: CreateLiveService, private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    this._availableStreamTypes = [
      {value: StreamTypes.kaltura, label: this._appLocalization.get('app.upload.prepareLive.streamTypes.kaltura')},
      {value: StreamTypes.manual, label: this._appLocalization.get('app.upload.prepareLive.streamTypes.manual')},
      {value: StreamTypes.universal, label: this._appLocalization.get('app.upload.prepareLive.streamTypes.universal')}
    ];
  }

  ngOnDestroy() {
  }

  submitCurrentSelectedForm() {
    if (this._selectedStreamType === StreamTypes.kaltura) {
      if (this.kalturaLiveStreamComponent.validate()) {
        this.createLiveService.createKalturaLiveStream(this.kalturaLiveStreamData)
          .cancelOnDestroy(this)
          .subscribe(response => {
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
  }

  private _updateAreaBlockerState(isBusy: boolean, message: AreaBlockerMessage): void {
    this._blockerState.isBusy = isBusy;
    this._blockerState.message = message;
  }
}
