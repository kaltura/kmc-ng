import { Component, OnDestroy, OnInit } from '@angular/core';
import { KalturaFlavorParams } from 'kaltura-ngx-client/api/types/KalturaFlavorParams';
import { TranscodingProfileFlavorsWidget } from './transcoding-profile-flavors-widget.service';

@Component({
  selector: 'kTranscodingProfilesFlavors',
  templateUrl: './transcoding-profile-flavors.component.html',
  styleUrls: ['./transcoding-profile-flavors.component.scss'],
})
export class TranscodingProfileFlavorsComponent implements OnInit, OnDestroy {
  public _selectedFlavors: KalturaFlavorParams[] = [];

  constructor(public _widgetService: TranscodingProfileFlavorsWidget) {
  }

  ngOnInit() {
    this._widgetService.attachForm();
    this._widgetService.preSelectedFlavors$
      .cancelOnDestroy(this)
      .subscribe((flavors) => {
        this._selectedFlavors = flavors;
      });
  }

  ngOnDestroy() {
    this._widgetService.detachForm();
  }

  public _clearSelection() {
    this._selectedFlavors = [];
  }

  public _onActionSelected(event: { action: string, flavor: KalturaFlavorParams }): void {
    this._clearSelection();
    this._widgetService.onActionSelected(event);
  }
}

