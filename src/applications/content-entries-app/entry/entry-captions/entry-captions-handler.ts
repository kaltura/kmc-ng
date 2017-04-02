import { Injectable, KeyValueDiffers, KeyValueDiffer,  IterableDiffers, IterableDiffer, KeyValueChangeRecord, CollectionChangeRecord } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { CaptionAssetSetAsDefaultAction, CaptionAssetListAction } from '@kaltura-ng2/kaltura-api/services/caption-asset';
import { KalturaCaptionAsset, KalturaFilterPager, KalturaAssetFilter } from '@kaltura-ng2/kaltura-api/types'

import { EntrySection } from '../../entry-store/entry-section-handler';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { EntrySectionsManager } from '../../entry-store/entry-sections-manager';

@Injectable()
export class EntryCaptionsHandler extends EntrySection
{
	captionsListDiffer: IterableDiffer;
	captionDiffer : { [key : string] : KeyValueDiffer } = {};

	private _captions : BehaviorSubject<{ items : KalturaCaptionAsset[], loading : boolean, error? : any}> = new BehaviorSubject<{ items : KalturaCaptionAsset[], loading : boolean, error? : any}>(
		{ items : null, loading : false}
	);

	public _captions$ = this._captions.asObservable().monitor('caption files');

	private _entryId: string = '';

    constructor(manager : EntrySectionsManager, private _objectDiffers:  KeyValueDiffers, private _listDiffers : IterableDiffers,
                private _kalturaServerClient: KalturaServerClient)
    {
        super(manager);
    }

    public get sectionType() : EntrySectionTypes
    {
        return EntrySectionTypes.Captions;
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    protected _reset()
    {
	    this._entryId = '';
	    this._captions.next({ loading : false, items : [], error : null});
    }

    protected _activate(firstLoad : boolean) {
	    this._entryId = this.data.id;
	    this._fetchCaptions();
    }

    private _fetchCaptions(): void{
	    this._captions.next({items : [], loading : true});


	    this._kalturaServerClient.request(new CaptionAssetListAction({
			    filter: new KalturaAssetFilter()
				    .setData(filter => {
					    filter.entryIdEqual = this._entryId;
				    }),
			    pager: new KalturaFilterPager().setData(
				    pager => {
					    pager.pageIndex = 0;
					    pager.pageSize = 100;
				    }
			    )
		    }))
		    .cancelOnDestroy(this,this.sectionReset$)
		    .monitor('get captions')
		    .subscribe(
			    response =>
			    {
				    this._captions.next({items : response.objects, loading : false});
				    this.captionsListDiffer = this._listDiffers.find([]).create(null);
				    this.captionsListDiffer.diff(this._captions.getValue().items);

				    this.captionDiffer = {};
				    this._captions.getValue().items.forEach((caption: KalturaCaptionAsset) => {
					    this.captionDiffer[caption.id] = this._objectDiffers.find([]).create(null);
					    this.captionDiffer[caption.id].diff(caption);
				    });
			    },
			    error =>
			    {
				    this._captions.next({items : [], loading : false, error : error});
			    }
		    );
    }

    public _setAsDefault(caption: KalturaCaptionAsset): void{
	    const captionId = caption.id;
	    let captions = Array.from(this._captions.getValue().items); // create a copy of the captions array withour a reference to the original array
	    captions.forEach((caption: KalturaCaptionAsset) => {
		   caption.isDefault = caption.id === captionId ? 1 : 0;
	    });
	    this._captions.next({items : captions, loading : false, error : null});
    }
}
