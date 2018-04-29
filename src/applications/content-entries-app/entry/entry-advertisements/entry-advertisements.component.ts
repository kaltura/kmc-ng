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

    constructor(public _widgetService: EntryAdvertisementsWidget,
                private _advertisementsAppViewService: AdvertisementsAppViewService,
                logger: KalturaLogger) {
      this._advertisementsEnabled = this._advertisementsAppViewService.isAvailable();
      if (!this._advertisementsEnabled) {
        logger.warn('Advertisements (kedit) is not enabled, please check configuration');
      }
    }

    ngOnInit() {
        this._widgetService.attachForm();
    }

    ngOnDestroy() {
        this._widgetService.detachForm();
    }
}

