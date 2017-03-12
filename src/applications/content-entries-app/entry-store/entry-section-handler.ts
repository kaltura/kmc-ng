import { Host, Injectable, OnDestroy } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';
import { EntryStore } from './entry-store.service';
import { KalturaMediaEntry } from '@kaltura-ng2/kaltura-api/types';
import { KalturaRequest, KalturaMultiRequest, KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { EntryLoading, SectionEntered, EntryLoaded } from './entry-sections-events';
import { EntrySectionTypes } from './entry-sections-types';

export interface OnEntryLoadedArgs
{
    entry : KalturaMediaEntry
}

export interface OnEntryLoadingArgs
{
    entryId : string;
    requests : KalturaRequest<any>[];
}

export interface OnSectionLoadingArgs
{
    firstTime : boolean;
    partOfEntryLoading : boolean;
    entryId : string;
    requests : KalturaRequest<any>[];
}



@Injectable()
export abstract class EntrySectionHandler implements OnDestroy
{
    public entry : KalturaMediaEntry;
    private _requireSectionReload : boolean = false;
    private _sectionLoadedOnce : boolean = false;
    private requestSubscription : ISubscription;


    public constructor(@Host() public store : EntryStore,
                       protected _kalturaServerClient: KalturaServerClient) {
        store.registerSection(this);

        store.events$
            .cancelOnDestroy(this)
            .subscribe(
                event => {
                    if (event instanceof EntryLoading) {
	                    this.entry = null;
                    	this._onSectionReset();

                        const requests: KalturaRequest<any>[] = [];

                        this._onEntryLoading({entryId : event.entryId,requests});

                        if (this.sectionType === event.activeSection) {
	                        this._requireSectionReload = false;
                            this._onSectionLoading({entryId: event.entryId, requests, firstTime : !this._sectionLoadedOnce, partOfEntryLoading : true});
                            this._sectionLoadedOnce = true;
                        }else {
                            this._requireSectionReload = true;
                        }

                        requests.forEach(request => event.request.requests.push(request));
                    } else if (event instanceof EntryLoaded)
                    {
                        this.entry = event.entry;
                        this._onEntryLoaded({entry : event.entry});
                    }
                    else if (event instanceof SectionEntered) {
                        if (this.entry && this._requireSectionReload && event.to === this.sectionType) {
                            this._requireSectionReload = false;
                            const requests: KalturaRequest<any>[] = [];
                            this._onSectionLoading({entryId: this.entry.id, requests, firstTime : !this._sectionLoadedOnce, partOfEntryLoading : false});
                            this._sectionLoadedOnce = true;

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

    protected abstract _onSectionReset() : void;
    protected abstract _onSectionLoading(data : OnSectionLoadingArgs);
    protected _onEntryLoaded(data : OnEntryLoadedArgs) : void {}
    protected _onEntryLoading(data : OnEntryLoadingArgs) : void {}

    ngOnDestroy()
    {
        this._onSectionReset();
    }


}
