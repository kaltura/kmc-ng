import { Component, OnDestroy, ViewChild } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { PreviewAndEmbedEvent } from 'app-shared/kmc-shared/events';
import { AppEventsService } from 'app-shared/kmc-shared';
import { KalturaPlaylist } from 'kaltura-ngx-client';
import { KalturaMediaEntry } from 'kaltura-ngx-client';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';
import { WindowClosedEvent } from 'app-shared/kmc-shared/events/window-closed.event';

@Component({
  selector: 'kPreviewEmbed',
  templateUrl: './preview-and-embed.component.html',
  styleUrls: ['./preview-and-embed.component.scss'],
})
export class PreviewEmbedComponent implements OnDestroy {

  @ViewChild('previewEmbed', { static: true }) previewEmbedPopup: PopupWidgetComponent;

  public _media: KalturaPlaylist | KalturaMediaEntry;

  constructor(private appEvents: AppEventsService) {
    appEvents.event(PreviewAndEmbedEvent)
	    .pipe(cancelOnDestroy(this))
	    .subscribe(({media}) =>
        {
          this._media = media;
          if ((media instanceof KalturaPlaylist || media instanceof KalturaMediaEntry) && !this.previewEmbedPopup.isShow) {
            this.previewEmbedPopup.open();
          }else{
            console.warn("Cannot open preview & embed (window already open?)");
          }
        });
  }

  public close(): void {
    this.appEvents.publish(new WindowClosedEvent('preview'));
    this.previewEmbedPopup.close();
  }

  ngOnDestroy(){

  }
}

