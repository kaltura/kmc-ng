import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { KalturaClient } from 'kaltura-ngx-client';
import { KalturaMediaEntryFilter } from 'kaltura-ngx-client/api/types/KalturaMediaEntryFilter';
import { KalturaFilterPager } from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import { KalturaDetachedResponseProfile } from 'kaltura-ngx-client/api/types/KalturaDetachedResponseProfile';
import { KalturaResponseProfileType } from 'kaltura-ngx-client/api/types/KalturaResponseProfileType';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { KalturaClipAttributes } from 'kaltura-ngx-client/api/types/KalturaClipAttributes';
import { KalturaOperationAttributes } from 'kaltura-ngx-client/api/types/KalturaOperationAttributes';
import { BaseEntryListAction } from 'kaltura-ngx-client/api/types/BaseEntryListAction';
import { AppLocalization, KalturaUtils } from '@kaltura-ng/kaltura-common';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';


import { EntryStore } from '../entry-store.service';
import { EntryWidgetKeys } from '../entry-widget-keys';
import { BrowserService } from "app-shared/kmc-shell/providers/browser.service";
import '@kaltura-ng/kaltura-common/rxjs/add/operators';

import { EntryWidget } from '../entry-widget';


export interface HighlightsData
{
    items : any[];
    totalItems : number;
}

@Injectable()
export class EntryHighlightsWidget extends EntryWidget implements OnDestroy
{
    private _highlights = new BehaviorSubject<HighlightsData>({ items : null, totalItems : 0});
    public entries$ = this._highlights.asObservable();
    public sortBy : string = 'createdAt';
    public sortAsc : boolean = false;
	private _pageSize: number = 50;
	public set pageSize(value: number){
    	this._pageSize = value;
		this.browserService.setInLocalStorage("highlightsPageSize", value);
    }
    public get pageSize(){return this._pageSize;}

    public pageIndex = 0 ;
    public pageSizesAvailable = [25,50,75,100];

    constructor(
                private _store : EntryStore,
                private _kalturaServerClient: KalturaClient,
                private browserService: BrowserService,
                private _appLocalization: AppLocalization) {
        super(EntryWidgetKeys.Highlights);
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
     protected onReset() : void{
        this.sortBy = 'createdAt';
        this.sortAsc = false;
        this.pageIndex = 0;

	    const defaultPageSize = this.browserService.getFromLocalStorage("highlightsPageSize");
	    if (defaultPageSize !== null){
		    this.pageSize = defaultPageSize;
	    }

        this._highlights.next({ items : [], totalItems : 0});
    }

    /**
     * Updates list of clips
     */
    public updateClips() : void
    {
        if (this.data) {
            this._getEntryHighlights('reload').subscribe(() =>
            {
	            // do nothing
            });
        }
    }

	public navigateToEntry(entryId) {
		this._store.openEntry(entryId);
	}

	private _getEntryHighlights(origin: 'activation' | 'reload') : Observable<{ failed: boolean, error?: Error }> {
		return Observable.create(observer =>
		{
	        const entry : KalturaMediaEntry = this.data;

            super._showLoader();

            // build the request
	        let requestSubscription = this._kalturaServerClient.request(new BaseEntryListAction({
                filter: new KalturaMediaEntryFilter(
                    {
                        rootEntryIdEqual : entry.id,
	                    tagsLike: 'highlights',
                        orderBy : `${this.sortAsc ? '+' : '-'}${this.sortBy}`
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
                .cancelOnDestroy(this,this.widgetReset$)
                .monitor('get entry hilights')
                .subscribe(
                    response => {
	                    super._hideLoader();
	                    this._highlights.next({items: response.objects, totalItems: response.totalCount});
	                    observer.next({failed: false});
	                    observer.complete();
                    },
                    error => {
                        this._highlights.next({items: [], totalItems: 0});
	                    super._hideLoader();
	                    if (origin === 'activation') {
		                    super._showActivationError();
	                    }else {
		                    this._showBlockerMessage(new AreaBlockerMessage(
			                    {
				                    message: this._appLocalization.get('applications.content.entryDetails.errors.clipsLoadError'),
				                    buttons: [
					                    {
						                    label: this._appLocalization.get('applications.content.entryDetails.errors.retry'),
						                    action: () => {
							                    this._getEntryHighlights('reload').subscribe(() =>
							                    {
								                    // do nothing
							                    });
						                    }
					                    }
				                    ]
			                    }
		                    ), true);
	                    }
	                    observer.error({failed: true, error: error});

                    });

			return () =>
			{
				if (requestSubscription)
				{
					requestSubscription.unsubscribe();
					requestSubscription = null;
				}
			}

		});

    }

    protected onActivate(firstTimeActivating: boolean) {
	    return this._getEntryHighlights('activation');
    }

	deleteEntry(entry: KalturaMediaEntry): void{
    	console.log("Delete entry id: +entry.id"); // TODO - implement code
	}

    ngOnDestroy()
    {

    }
}
