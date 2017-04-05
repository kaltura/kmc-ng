import { Injectable, KeyValueDiffers, KeyValueDiffer,  IterableDiffers, IterableDiffer, KeyValueChangeRecord, CollectionChangeRecord } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { CaptionAssetSetAsDefaultAction, CaptionAssetListAction, KalturaCaptionAsset, KalturaFilterPager, KalturaAssetFilter, KalturaCaptionType, KalturaCaptionAssetStatus } from '@kaltura-ng2/kaltura-api/types';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';

import { EntrySection } from '../../entry-store/entry-section-handler';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { EntrySectionsManager } from '../../entry-store/entry-sections-manager';

export interface CaptionRow {
	uploadStatus: boolean,
	uploadToken: string,
	id: string,
	isDefault: number
}
@Injectable()
export class EntryCaptionsHandler extends EntrySection
{
	captionsListDiffer: IterableDiffer;
	captionDiffer : { [key : string] : KeyValueDiffer } = {};

	private _captions : BehaviorSubject<{ items : CaptionRow[], loading : boolean, error? : any}> = new BehaviorSubject<{ items : CaptionRow[], loading : boolean, error? : any}>(
		{ items : null, loading : false}
	);

	public _captions$ = this._captions.asObservable().monitor('caption files');

	private _entryId: string = '';

    constructor(manager : EntrySectionsManager, private _objectDiffers:  KeyValueDiffers, private _listDiffers : IterableDiffers,
                private _kalturaServerClient: KalturaServerClient, private _appLocalization:AppLocalization)
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
				    this._captions.next({items : response.objects as any[], loading : false});
				    this.captionsListDiffer = this._listDiffers.find([]).create(null);
				    this.captionsListDiffer.diff(this._captions.getValue().items);

				    this.captionDiffer = {};
				    this._captions.getValue().items.forEach((caption) => {
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
	    captions.forEach((caption) => {
		   caption.isDefault = caption.id === captionId ? 1 : 0;
	    });
	    this._captions.next({items : captions, loading : false, error : null});
    }

    public _getCaptionType(captionFormat: KalturaCaptionType): string{
	    let type = this._appLocalization.get('app.common.n_a');
	    switch (captionFormat.toString()){
		    case KalturaCaptionType.Srt.toString():
		    	type = "SRT";
			    break;
		    case KalturaCaptionType.Dfxp.toString():
		    	type = "DFXP";
			    break;
		    case KalturaCaptionType.Webvtt.toString():
		    	type = "WEBVTT";
			    break;
	    }
	    return type;
    }

    public _getCaptionStatus(captionStatus: KalturaCaptionAssetStatus): string{
	    let status = this._appLocalization.get('applications.content.entryDetails.captions.processing');
	    switch (captionStatus.toString()){
		    case KalturaCaptionAssetStatus.Error.toString():
			    status = this._appLocalization.get('applications.content.entryDetails.captions.error');
			    break;
		    case KalturaCaptionAssetStatus.Ready.toString():
			    status = this._appLocalization.get('applications.content.entryDetails.captions.saved');
			    break;
	    }
	    return status;
    }

	public removeCaption(caption: CaptionRow): void{
		// update the list by filtering the assets array.

		this._captions.next({items : this._captions.getValue().items.filter((item: CaptionRow) => {return item !== caption}), loading : false});

		// stop tracking changes on this asset
		// if file id is empty it was added by the user so no need to track its changes.
		if (caption.id && this.captionDiffer[caption.id]){
			delete this.captionDiffer[caption.id];
		}
	}

    public _getRowStyle(rowData, rowIndex): string{
	    return rowData.uploadStatus ? "uoloading" : '';
    }

    public _onFileSelected(selectedFiles: FileList){
	    if (selectedFiles.length){
		    alert("got the file: "+selectedFiles[0].name);
	    }
    }
}
