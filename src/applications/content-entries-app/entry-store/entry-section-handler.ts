import { Host, Injectable, OnDestroy } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';
import { EntryStore } from './entry-store.service';
import { KalturaMediaEntry } from '@kaltura-ng2/kaltura-api/types';
import { KalturaRequest, KalturaMultiRequest, KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { EntryLoading, SectionEntered } from './entry-sections-events';
import { EntrySectionTypes } from './entry-sections-types';


@Injectable()
export abstract class EntrySectionHandler implements OnDestroy
{
    public entry : KalturaMediaEntry;
    private _sectionLoaded : boolean = false;
    private requestSubscription : ISubscription;

    public constructor(@Host() public store : EntryStore,
                       protected _kalturaServerClient: KalturaServerClient) {
        store.registerSection(this);

        store.entry$
            .cancelOnDestroy(this)
            .subscribe(entry => {
                this.entry = entry;
            });

        store.events$
            .cancelOnDestroy(this)
            .subscribe(
                event => {
                    if (event instanceof EntryLoading) {
	                    this._sectionLoaded = false;
                    	this._resetSection();

                        if (this.sectionType === event.activeSection) {
	                        this._sectionLoaded = true;
                            const requests: KalturaRequest<any>[] = [];
                            this._onSectionLoading({entryId: event.entryId, requests});
                            requests.forEach(request => event.request.requests.push(request));
                        }
                    } else if (event instanceof SectionEntered) {
                        if (this.entry && !this._sectionLoaded && event.to === this.sectionType) {
                            this._sectionLoaded = true;
                            const requests: KalturaRequest<any>[] = [];
                            this._onSectionLoading({entryId: this.entry.id, requests});

                            if (requests.length) {
                                const multiRequest = new KalturaMultiRequest(...requests);

                                this._kalturaServerClient.multiRequest(multiRequest)
                                    .cancelOnDestroy(this)
                                    .subscribe();
                            }
                        }
                    }
                }
            );
    }

    public abstract get sectionType() : EntrySectionTypes;
    protected  abstract _resetSection() : void;
    protected abstract _onSectionLoading(data : {entryId : string, requests : KalturaRequest<any>[]});

    ngOnDestroy()
    {
        this._resetSection();
    }


}
