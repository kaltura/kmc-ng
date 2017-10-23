import {Component, OnInit, AfterViewInit, OnDestroy, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'kAddEntry',
  templateUrl: './playlist-add-entry.component.html',
  styleUrls: ['./playlist-add-entry.component.scss']
})
export class PlaylistAddEntryComponent implements  OnInit, AfterViewInit, OnDestroy {

  @Output() onClosePopupWidget = new EventEmitter<any>();

  constructor() {}

  closePopupWidget() {
    this.onClosePopupWidget.emit();
  }

  ngOnInit(){}

  ngAfterViewInit(){}

  ngOnDestroy(){}
}

