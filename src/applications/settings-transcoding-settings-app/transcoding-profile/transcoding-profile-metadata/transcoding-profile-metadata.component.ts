import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranscodingProfileMetadataWidget } from './transcoding-profile-metadata-widget.service';

@Component({
  selector: 'kTranscodingProfileMetadata',
  templateUrl: './transcoding-profile-metadata.component.html',
  styleUrls: ['./transcoding-profile-metadata.component.scss']
})

export class TranscodingProfileMetadataComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('metadataNameInput', { static: false }) public metadataNameInput;

  constructor(public _widgetService: TranscodingProfileMetadataWidget) {
  }

  ngOnInit() {
    this._widgetService.attachForm();
  }

  ngOnDestroy() {
    this._widgetService.detachForm();
  }

  ngAfterViewInit() {
    this.metadataNameInput.nativeElement.focus();
  }
}

