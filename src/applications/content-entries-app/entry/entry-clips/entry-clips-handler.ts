import { Injectable, OnDestroy } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { KalturaMultiRequest, KalturaServerClient, KalturaUtils } from '@kaltura-ng2/kaltura-api';
import { KalturaBaseEntryFilter, KalturaFilterPager, KalturaDetachedResponseProfile, KalturaResponseProfileType, KalturaMediaEntry, KalturaClipAttributes, KalturaOperationAttributes } from '@kaltura-ng2/kaltura-api/types';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';

import { EntrySectionHandler } from '../../entry-store/entry-section-handler';
import { EntryStore } from '../../entry-store/entry-store.service';
import { EntryLoaded, EntryLoading, SectionEntered } from '../../entry-store/entry-sections-events';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import { BaseEntryListAction } from '@kaltura-ng2/kaltura-api/services/base-entry';
import { BrowserService } from "kmc-shell/providers/browser.service";
import TakeUntilDestroy  from "angular2-take-until-destroy";
import { KalturaRequest } from '@kaltura-ng2/kaltura-api';

export interface EntriesData
{
    loading : boolean;
    items : any[];
    error? : string;
    totalItems : number;
}



@Injectable()
@TakeUntilDestroy
export class EntryClipsHandler extends EntrySectionHandler
{
    private _entries : BehaviorSubject<EntriesData> = new BehaviorSubject<EntriesData>({ loading : false, items : null, totalItems : 0});
    private _entriesRequested; // default value is set in function _resetState
    public entries$ = this._entries.asObservable();
    private _entriesLoadSubscription : ISubscription = null;
    public sortBy : string; // default value is set in function _resetState
    public sortAsc : boolean; // default value is set in function _resetState
    public _rootEntryId : string; // default value is set in function _resetState

	private _pageSize: number = 50;
	public set pageSize(value: number){
    	this._pageSize = value;
		this.browserService.setInLocalStorage("clipsPageSize", value);
    }
    public get pageSize(){return this._pageSize;}

    public pageIndex; // default value is set in function _resetState
    public pageSizesAvailable = [25,50,75,100];

    constructor(store : EntryStore,
                private kalturaServerClient: KalturaServerClient,
                private browserService: BrowserService,
                private _appLocalization: AppLocalization) {
        super(store);

        this._resetState(kalturaServerClient);

        store.events$
            .takeUntil((<any>this).componentDestroy())
            .subscribe(
            event =>
            {
                if (event instanceof EntryLoading)
                {
                    this._resetState();

                    this._rootEntryId = event.entryId;

                    if (event.activeSection === EntrySectionTypes.Clips) {
                        this._updateEntries(event.request);
                    }
                }else if (event instanceof SectionEntered)
                {
                    if (!this._entriesRequested && event.to === EntrySectionTypes.Clips)
                    {
                        // only update entries if the user entered this section and the request was never transmitted
                        // for that entry
                        this._updateEntries();
                    }
                }
            }
        );
    }

    public get sectionType() : EntrySectionTypes
    {
        return EntrySectionTypes.Clips;
    }
    /**
     * Reset handler state and abort any previous requests sent for previous entriess
     * @private
     */
    private _resetSection() : void{

        if (this._entriesLoadSubscription)
        {
            // stop any on-going requests of previous entry id
            this._entriesLoadSubscription.unsubscribe();
            this._entriesLoadSubscription = null;
        }

        this._entriesRequested = false;
        this._rootEntryId = null;
        this.sortBy = 'createdAt';
        this.sortAsc = false;
        this.pageIndex = 0;

	    const defaultPageSize = this.browserService.getFromLocalStorage("clipsPageSize");
	    if (defaultPageSize !== null){
		    this.pageSize = defaultPageSize;
	    }

        this._entries.next({ loading : false, items : [], totalItems : 0, error : null});
    }

    /**
     * Updates list of entries by another component
     */
    public updateEntries() : void
    {
        this._updateEntries();
    }

    /**
     * Updates list of entries
     *
     * @param parentRequest (KalturaMultiRequest) add the request to the entry loading global request if provided
     * @private
     */
    private _updateEntries(parentRequest? : KalturaMultiRequest) : void {
        this._entriesRequested = true;

        if (this._rootEntryId) {

            // update entries loading status.
            // show loading indication only if the request was originated from this handler
            // also preserve the entries list (otherwise the ui will remove then during the update
            this._entries.next({loading: !parentRequest, items:  this._entries.getValue().items, totalItems: this._entries.getValue().totalItems});

            // build the request
            const request = new BaseEntryListAction({
                filter: new KalturaBaseEntryFilter()
                    .setData(filter => {
                        filter.rootEntryIdEqual = this._rootEntryId;
                        filter.orderBy = `${this.sortAsc ? '' : '-'}${this.sortBy}`;
                    }),
                pager: new KalturaFilterPager()
                    .setData(pager => {
                            pager.pageSize = this.pageSize;
                            pager.pageIndex = this.pageIndex + 1;
                        }
                    ),
                responseProfile: new KalturaDetachedResponseProfile()
                    .setData(responseProfile => {
                        responseProfile.type = KalturaResponseProfileType.IncludeFields;
                        responseProfile.fields = 'id,name,plays,createdAt,duration,status,offset,operationAttributes,moderationStatus';
                    })
            }).setCompletion(response => {
                // handle response from the server
                if (response.result) {
                    this._entries.next({
                        loading: false,
                        items: this.updateClipProperties(response.result.objects),
                        totalItems: response.result.totalCount
                    });
                } else {
                    this._entries.next({loading: false, items: [], totalItems: 0, error: response.error.message});
                }
            });

            if (parentRequest) {
                parentRequest.requests.push(request);
            } else {
                this._kalturaServerClient.request(request).subscribe(
                    () => {
                        // do nothing (handled by setCompletion)
                    }
                )
            }
        }
    }
	public navigateToEntry(entryId) {
		this.store.openEntry(entryId);
	}

	private updateClipProperties(clips: any[]): any[]{
		clips.forEach((clip:any) =>{
			clip['offset'] = this.getClipOffset(clip);
			clip['duration'] = this.getClipDuration(clip);
		});
		return clips;
	}

	private getClipOffset(entry: KalturaMediaEntry): string{
		let offset: number = -1;
		if (entry.operationAttributes && entry.operationAttributes.length){
			entry.operationAttributes.forEach((attr: KalturaOperationAttributes) => {
				if (attr instanceof KalturaClipAttributes){
					if (attr.offset && offset === -1) { // take the first offset we find as in legacy KMC
						offset = attr.offset;
					}
				}
			});
		}
		return offset !== -1 ? KalturaUtils.formatTime(offset) : this._appLocalization.get('applications.content.entryDetails.clips.n_a');
	}

	private getClipDuration(entry: KalturaMediaEntry): string{
		let duration: number = -1;
		if (entry.operationAttributes && entry.operationAttributes.length){
			entry.operationAttributes.forEach((attr: KalturaOperationAttributes) => {
				if (attr instanceof KalturaClipAttributes){
					if (attr.duration && duration === -1) { // take the first duration we find
						duration = attr.duration;
					}
				}
			});
		}
		// fallback to entry duration if no clip duration is found
		if (duration === -1 && entry.duration){
			duration = entry.duration;
		}
		return duration !== -1 ? KalturaUtils.formatTime(duration) : this._appLocalization.get('applications.content.entryDetails.clips.n_a');
	}


    /**
     * Do some cleanups if needed once the section is removed
     */
    _resetSection()
    {
        this._entries.complete();
    }

    protected _onSectionLoading(data: {entryId: string; requests: KalturaRequest<any>[]}) {
        return undefined;
    }
}