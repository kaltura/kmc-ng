import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { KalturaLiveStreamEntry } from 'kaltura-ngx-client';
import { ToggleLiveService } from './toggle-live.service';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';

@Component({
    selector: 'k-toggle-live-btn',
    templateUrl: './toggle-live.component.html',
    styleUrls: ['./toggle-live.component.scss'],
    providers: [ToggleLiveService],
})
export class ToggleLiveComponent implements OnInit, OnDestroy {
    @Input() entry: KalturaLiveStreamEntry;

    public _isPreview = false;

    constructor(public _toggleLiveService: ToggleLiveService) {
    }

    ngOnInit() {
        if (this.entry) {
            this._toggleLiveService.startPolling(this.entry);

            this._toggleLiveService.isPreview$
                .pipe(cancelOnDestroy(this))
                .subscribe(isPreview => {
                    this._isPreview = isPreview;
                });
        }
    }

    ngOnDestroy(): void {
    }


    public _toggleViewMode(): void {
        this._toggleLiveService.toggle();
    }
}
