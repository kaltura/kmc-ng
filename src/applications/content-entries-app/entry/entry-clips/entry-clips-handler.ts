import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { KalturaBaseEntryFilter, KalturaFilterPager, KalturaDetachedResponseProfile, KalturaResponseProfileType, KalturaMediaEntry,
	KalturaClipAttributes, KalturaOperationAttributes,
    BaseEntryListAction } from 'kaltura-typescript-client/types/all';
import { AppLocalization, KalturaUtils } from '@kaltura-ng2/kaltura-common';

import {
    EntrySection
} from '../../entry-store/entry-section-handler';
import { EntryStore } from '../../entry-store/entry-store.service';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import { BrowserService } from "kmc-shell/providers/browser.service";
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';
import { EntrySectionsManager } from '../../entry-store/entry-sections-manager';


export interface ClipsData
{
    loading : boolean;
    items : any[];
    error? : string;
    totalItems : number;
}



@Injectable()
export class EntryClipsHandler extends EntrySection
{
    private _clips : BehaviorSubject<ClipsData> = new BehaviorSubject<ClipsData>({ loading : false, items : null, totalItems : 0});
    public entries$ = this._clips.asObservable();
    public sortBy : string = 'createdAt';
    public sortAsc : boolean = false;
	private _pageSize: number = 50;
	public set pageSize(value: number){
    	this._pageSize = value;
		this.browserService.setInLocalStorage("clipsPageSize", value);
    }
    public get pageSize(){return this._pageSize;}

    public pageIndex = 0 ;
    public pageSizesAvailable = [25,50,75,100];

    constructor(manager : EntrySectionsManager,
                private _store : EntryStore,
                private _kalturaServerClient: KalturaClient,
                private browserService: BrowserService,
                private _appLocalization: AppLocalization) {
        super(manager);
    }

    public get sectionType() : EntrySectionTypes
    {
        return EntrySectionTypes.Clips;
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
     protected _reset() : void{
        this.sortBy = 'createdAt';
        this.sortAsc = false;
        this.pageIndex = 0;

	    const defaultPageSize = this.browserService.getFromLocalStorage("clipsPageSize");
	    if (defaultPageSize !== null){
		    this.pageSize = defaultPageSize;
	    }

        this._clips.next({ loading : false, items : [], totalItems : 0, error : null});
    }

    /**
     * Updates list of clips
     */
    public updateClips() : void
    {
        if (this.data) {
            this._getEntryClips();
        }
    }

	public navigateToEntry(entryId) {
		this._store.openEntry(entryId);
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

	private _getEntryClips() : void {
        const entry : KalturaMediaEntry = this.data;

        if (entry) {
            this._clips.next({
                loading: true,
                items: this._clips.getValue().items,
                totalItems: this._clips.getValue().totalItems
            });

            // build the request
            this._kalturaServerClient.request(new BaseEntryListAction({
                filter: new KalturaBaseEntryFilter(
                    {
                        rootEntryIdEqual : entry.id,
                        orderBy : `${this.sortAsc ? '' : '-'}${this.sortBy}`
                    }
                ),
                pager: new KalturaFilterPager(
                    {
                        pageSize : this.pageSize,
                        pageIndex : this.pageIndex + 1
                    }
                ),
                responseProfile: new KalturaDetachedResponseProfile({
                    type : KalturaResponseProfileType.includeFields,
                    fields : 'id,name,plays,createdAt,duration,status,offset,operationAttributes,moderationStatus'
                })
            }))
                .cancelOnDestroy(this,this.sectionReset$)
                .monitor('get entry clips')
                .subscribe(
                    response => {
                            this._clips.next({
                                loading: false,
                                items: this._updateClipProperties(response.objects),
                                totalItems: response.totalCount
                            });
                    },
                    error => {
                        this._clips.next({loading: false, items: [], totalItems: 0, error});

                    });
        }

    }

    protected _activate(firstLoad : boolean) {

        this._getEntryClips();
    }
}
