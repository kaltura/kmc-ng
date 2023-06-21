import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { KalturaRoomEntry } from 'kaltura-ngx-client';
import { RoomDetailsWidget } from './room-details-widget.service';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';
import { AppLocalization } from "@kaltura-ng/mc-shared";
import { filter } from 'rxjs/operators';

@Component({
  selector: 'kRoomDetails',
  templateUrl: './room-details.component.html',
  styleUrls: ['./room-details.component.scss']
})
export class RoomDetailsComponent implements OnInit, OnDestroy {

  @Input() isRapt: boolean;

  public _currentRoom: KalturaRoomEntry;
  public _isNew = false;

  constructor(
    public _widgetService: RoomDetailsWidget,
    public _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    this._widgetService.attachForm();
    this._widgetService.data$
      .pipe(cancelOnDestroy(this))
      .pipe(filter(Boolean))
      .subscribe((data: KalturaRoomEntry) => {
        this._currentRoom = data;
        this._isNew = !this._currentRoom.id;
      });
  }

  ngOnDestroy() {
    this._widgetService.detachForm();
  }
}

