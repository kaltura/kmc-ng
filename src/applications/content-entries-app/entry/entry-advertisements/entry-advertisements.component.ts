import {Component, OnDestroy, OnInit} from '@angular/core';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {EntryAdvertisementsWidget} from './entry-advertisements-widget.service';
import { AdvertisementsAppViewService } from 'app-shared/kmc-shared/kmc-views/component-views';


@Component({
    selector: 'kEntryAdvertisements',
    templateUrl: './entry-advertisements.component.html',
    styleUrls: ['./entry-advertisements.component.scss']
})
export class EntryAdvertisementsComponent implements OnInit, OnDestroy {

    public _advertisementsEnabled = false;
    public _advertisementsDisabledReason: string = null;

    constructor(public _widgetService: EntryAdvertisementsWidget,
                private _advertisementsAppViewService: AdvertisementsAppViewService,
                logger: KalturaLogger) {
    }

    ngOnInit() {
        this._widgetService.attachForm();

        this._widgetService.data$.subscribe(
            data => {
                if (data) {
                    this._advertisementsEnabled = this._advertisementsAppViewService.isAvailable({ entry: data });
                }
            }
        );
    }

    ngOnDestroy() {
        this._widgetService.detachForm();
    }
}

