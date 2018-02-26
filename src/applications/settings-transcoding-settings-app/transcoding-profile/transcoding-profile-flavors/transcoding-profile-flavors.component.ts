import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { KalturaFlavorParams } from 'kaltura-ngx-client/api/types/KalturaFlavorParams';
import { TranscodingProfileFlavorsWidget } from './transcoding-profile-flavors-widget.service';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

@Component({
  selector: 'kTranscodingProfilesFlavors',
  templateUrl: './transcoding-profile-flavors.component.html',
  styleUrls: ['./transcoding-profile-flavors.component.scss'],
})
export class TranscodingProfileFlavorsComponent implements OnInit, OnDestroy {
  @ViewChild('editMediaProfileFlavor') _editMediaProfileFlavorPopup: PopupWidgetComponent;

  public _selectedFlavor: KalturaFlavorParams;

  constructor(public _widgetService: TranscodingProfileFlavorsWidget) {
  }

  ngOnInit() {
    this._widgetService.attachForm();
  }

  ngOnDestroy() {
    this._widgetService.detachForm();
  }

  public _onActionSelected(event: { action: string, flavor: KalturaFlavorParams }): void {
    this._widgetService.onActionSelected(event);
  }

  public _editFlavor(flavor: KalturaFlavorParams): void {
    this._selectedFlavor = flavor;
    this._editMediaProfileFlavorPopup.open();
  }
}

