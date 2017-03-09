import { Injectable, OnDestroy } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { KalturaMultiRequest, KalturaServerClient, KalturaUtils } from '@kaltura-ng2/kaltura-api';
import { KalturaBaseEntryFilter, KalturaFilterPager, KalturaDetachedResponseProfile, KalturaResponseProfileType, KalturaMediaEntry, KalturaClipAttributes, KalturaOperationAttributes } from '@kaltura-ng2/kaltura-api/types';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';

import { EntrySectionHandler, OnSectionLoadingArgs } from '../../entry-store/entry-section-handler';
import { EntryStore } from '../../entry-store/entry-store.service';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import { BaseEntryListAction } from '@kaltura-ng2/kaltura-api/services/base-entry';
import { BrowserService } from "kmc-shell/providers/browser.service";
import { KalturaRequest } from '@kaltura-ng2/kaltura-api';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';


export interface ClipsData
{
    loading : boolean;
    items : any[];
    error? : string;
    totalItems : number;
}



@Injectable()
export class EntryClipsHandler extends EntrySectionHandler
{
    private _clips : BehaviorSubject<ClipsData> = new BehaviorSubject<ClipsData>({ loading : false, items : null, totalItems : 0});
    public entries$ = this._clips.asObservable();
    public sortBy : string; // default value is set in function _onSectionReset
    public sortAsc : boolean; // default value is set in function _onSectionReset

    private _updateClipsSubscription : ISubscription;
	private _pageSize: number = 50;
	public set pageSize(value: number){
    	this._pageSize = value;
		this.browserService.setInLocalStorage("clipsPageSize", value);
    }
    public get pageSize(){return this._pageSize;}

    public pageIndex; // default value is set in function _onSectionReset
    public pageSizesAvailable = [25,50,75,100];

    constructor(store : EntryStore,
                kalturaServerClient: KalturaServerClient,
                private browserService: BrowserService,
                private _appLocalization: AppLocalization) {
        super(store, kalturaServerClient);
    }

    public get sectionType() : EntrySectionTypes
    {
        return EntrySectionTypes.Clips;
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
     protected _onSectionReset() : void{
        this.sortBy = 'createdAt';
        this.sortAsc = false;
        this.pageIndex = 0;

	    const defaultPageSize = this.browserService.getFromLocalStorage("clipsPageSize");
	    if (defaultPageSize !== null){
		    this.pageSize = defaultPageSize;
	    }

	    if (this._updateClipsSubscription) {
            this._updateClipsSubscription.unsubscribe();
            this._updateClipsSubscription = null;
        }

        this._clips.next({ loading : false, items : [], totalItems : 0, error : null});
    }

    /**
     * Updates list of clips
     */
    public updateClips() : void
    {
        if (this.entry) {
            this._updateClips();
        }
    }

    /**
     * Updates list of entries
     *
     * @param parentRequest (KalturaMultiRequest) add the request to the entry loading global request if provided
     * @private
     */
    private _updateClips() : void {
        if (this.entry) {
            this._clips.next({
                loading: true,
                items: this._clips.getValue().items,
                totalItems: this._clips.getValue().totalItems
            });

            this._updateClipsSubscription = this._kalturaServerClient.request(this._getClipsRequest(this.entry.id))
                .subscribe(
                    () => {
                        // do nothing (handled by setCompletion)
                    })
        }
    }

    private _getClipsRequest(entryId : string) : BaseEntryListAction
    {
        // build the request
        return new BaseEntryListAction({
            filter: new KalturaBaseEntryFilter()
                .setData(filter => {
                    filter.rootEntryIdEqual = entryId;
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
                this._clips.next({
                    loading: false,
                    items: this._updateClipProperties(response.result.objects),
                    totalItems: response.result.totalCount
                });
            } else {
                this._clips.next({loading: false, items: [], totalItems: 0, error: response.error.message});
            }
        });
    }

	public navigateToEntry(entryId) {
		this.store.openEntry(entryId);
	}

	private _updateClipProperties(clips: any[]): any[]{
		clips.forEach((clip:any) =>{
			clip['offset'] = this._getClipOffset(clip);
			clip['duration'] = this._getClipDuration(clip);
		});
		return clips;
	}

	private _getClipOffset(entry: KalturaMediaEntry): string{
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

	private _getClipDuration(entry: KalturaMediaEntry): string{
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

    protected _onSectionLoading(data : OnSectionLoadingArgs) {
        if(!data.partOfEntryLoading)
        {
            this._clips.next({
                loading: true,
                items: [],
                totalItems: 0
            });
        }

        data.requests.push(this._getClipsRequest(data.entryId));
    }
}
