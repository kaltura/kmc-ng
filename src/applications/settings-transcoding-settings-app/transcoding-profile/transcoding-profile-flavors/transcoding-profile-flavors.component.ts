import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { KalturaFlavorParams } from 'kaltura-ngx-client';
import { TranscodingProfileFlavorsWidget } from './transcoding-profile-flavors-widget.service';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { KalturaConversionProfileType } from 'kaltura-ngx-client';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';

@Component({
  selector: 'kTranscodingProfilesFlavors',
  templateUrl: './transcoding-profile-flavors.component.html',
  styleUrls: ['./transcoding-profile-flavors.component.scss'],
  providers: [KalturaLogger.createLogger('TranscodingProfileFlavorsComponent')]
})
export class TranscodingProfileFlavorsComponent implements OnInit, OnDestroy {
  @ViewChild('editMediaProfileFlavor', { static: false }) _editMediaProfileFlavorPopup: PopupWidgetComponent;
  @ViewChild('editLiveProfileFlavor', { static: false }) _editLiveProfileFlavorPopup: PopupWidgetComponent;

  public _selectedFlavor: KalturaFlavorParams;

  constructor(public _widgetService: TranscodingProfileFlavorsWidget,
              private _logger: KalturaLogger) {
  }

  ngOnInit() {
    this._widgetService.attachForm();
  }

  ngOnDestroy() {
    this._widgetService.detachForm();
  }

  public _editFlavor(flavor: KalturaFlavorParams): void {
    this._logger.info(`handle edit flavor action by user`, { id: flavor.id, name: flavor.name });
    this._selectedFlavor = flavor;

    if (this._widgetService.data.type === KalturaConversionProfileType.media) {
      this._editMediaProfileFlavorPopup.open();
    } else if (this._widgetService.data.type === KalturaConversionProfileType.liveStream) {
      this._editLiveProfileFlavorPopup.open();
    }
  }
}
