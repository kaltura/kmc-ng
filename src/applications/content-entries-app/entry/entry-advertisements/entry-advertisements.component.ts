import {Component, OnDestroy, OnInit} from '@angular/core';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {EntryAdvertisementsWidget} from './entry-advertisements-widget.service';
import { AdvertisementsAppViewService } from 'app-shared/kmc-shared/kmc-views/component-views';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { EntryStore } from '../entry-store.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';

@Component({
    selector: 'kEntryAdvertisements',
    templateUrl: './entry-advertisements.component.html',
    styleUrls: ['./entry-advertisements.component.scss']
})
export class EntryAdvertisementsComponent implements OnInit, OnDestroy {

    public _advertisementsEnabled = false;

    constructor(public _widgetService: EntryAdvertisementsWidget,
                public _store: EntryStore,
                private _advertisementsAppViewService: AdvertisementsAppViewService,
                logger: KalturaLogger) {
    }

    ngOnInit() {
        this._widgetService.attachForm();

        Observable.merge(
            this._widgetService.data$,
            this._store.hasSource.value$
        )
            .cancelOnDestroy(this)
            .subscribe(
                () => {
                    if (this._widgetService.data) {
                        this._advertisementsEnabled = this._advertisementsAppViewService.isAvailable({
                            entry: this._widgetService.data,
                            hasSource: this._store.hasSource.value()
                        });
                    } else {
                        this._advertisementsEnabled = false;
                    }

                }
            );
    }

    ngOnDestroy() {
        this._widgetService.detachForm();
    }
}

