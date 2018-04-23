import {Component, OnDestroy, OnInit} from '@angular/core';
import {serverConfig} from 'config/server';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {EntryAdvertisementsWidget} from './entry-advertisements-widget.service';
import {KEditHosterService} from 'app-shared/kmc-shared';


@Component({
    selector: 'kEntryAdvertisements',
    templateUrl: './entry-advertisements.component.html',
    styleUrls: ['./entry-advertisements.component.scss']
})
export class EntryAdvertisementsComponent implements OnInit, OnDestroy {

    public _advertisementsEnabled = false;
    public _advertisementsDisabledReason: string = null;

    constructor(public _widgetService: EntryAdvertisementsWidget, logger: KalturaLogger,
                private _keditHosterService: KEditHosterService) {
      this._advertisementsEnabled = serverConfig.externalApps.advertisements.enabled;
      if (!this._advertisementsEnabled) {
        logger.warn('Advertisements (kedit) is not enabled, please check configuration');
      }
    }

    ngOnInit() {
        this._widgetService.attachForm();

        this._widgetService.data$.subscribe(
            data => {
                if (data) {
                    const isAvailableResult = this._keditHosterService.isAdvertisementsAvailable(data);
                    this._advertisementsEnabled = isAvailableResult.isAvailable;
                    this._advertisementsDisabledReason = isAvailableResult.reason;
                }
            }
        );
    }

    ngOnDestroy() {
        this._widgetService.detachForm();
    }
}

