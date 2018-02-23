import { Component, OnDestroy, OnInit } from '@angular/core';
import { KalturaFlavorParams } from 'kaltura-ngx-client/api/types/KalturaFlavorParams';
import { TranscodingProfileFlavorsWidget } from './transcoding-profile-flavors-widget.service';

@Component({
  selector: 'kTranscodingProfilesFlavors',
  templateUrl: './transcoding-profile-flavors.component.html',
  styleUrls: ['./transcoding-profile-flavors.component.scss'],
})
export class TranscodingProfileFlavorsComponent implements OnInit, OnDestroy {
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
}

