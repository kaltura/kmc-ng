import {Component, OnDestroy, OnInit} from '@angular/core';
import {serverConfig} from 'config/server';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {EntryAdvertisementsWidget} from './entry-advertisements-widget.service';


@Component({
    selector: 'kEntryAdvertisements',
    templateUrl: './entry-advertisements.component.html',
    styleUrls: ['./entry-advertisements.component.scss']
})
export class EntryAdvertisementsComponent implements OnInit, OnDestroy {

    public _advertisementsEnabled = false;

    constructor(public _widgetService: EntryAdvertisementsWidget, logger: KalturaLogger) {
      this._advertisementsEnabled = serverConfig.externalApps.advertisements.enabled;
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

