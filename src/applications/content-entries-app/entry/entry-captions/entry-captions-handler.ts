import { Injectable, KeyValueDiffers, KeyValueDiffer,  IterableDiffers, IterableDiffer, KeyValueChangeRecord, CollectionChangeRecord } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { KalturaMultiRequest } from 'kaltura-typescript-client';
import { CaptionAssetListAction, CaptionAssetDeleteAction, CaptionAssetSetAsDefaultAction, CaptionAssetUpdateAction, CaptionAssetSetContentAction,
	CaptionAssetAddAction, KalturaUrlResource, KalturaUploadedFileTokenResource, KalturaCaptionAsset, KalturaFilterPager, KalturaAssetFilter,
	KalturaCaptionType, KalturaCaptionAssetStatus, KalturaLanguage, KalturaMediaEntry } from 'kaltura-typescript-client/types';

import { AppLocalization } from '@kaltura-ng2/kaltura-common';

import { EntrySection } from '../../entry-store/entry-section-handler';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import { EntrySectionsManager } from '../../entry-store/entry-sections-manager';
import { KalturaOVPFile } from '@kaltura-ng2/kaltura-common/upload-management/kaltura-ovp';
import { UploadManagement, FileChanges } from '@kaltura-ng2/kaltura-common/upload-management';

export interface CaptionRow {
	uploading: boolean,
	uploadToken: string,
	uploadUrl: string,
	id: string,
	isDefault: number,
	format: KalturaCaptionType,
	language: KalturaLanguage,
	label: string
}

@Injectable()
export class EntryCaptionsHandler extends EntrySection
{
	captionsListDiffer: IterableDiffer;
	captionDiffer : { [key : string] : KeyValueDiffer } = {};

	private _captions : BehaviorSubject<{ items : CaptionRow[], loading : boolean, error? : any}> = new BehaviorSubject<{ items : CaptionRow[], loading : boolean, error? : any}>(
		{ items : [], loading : false}
	);

	public _captions$ = this._captions.asObservable().monitor('caption files');
	public currentCaption: CaptionRow;

	private _entryId: string = '';

    constructor(manager : EntrySectionsManager, private _objectDiffers:  KeyValueDiffers, private _listDiffers : IterableDiffers,
                private _kalturaServerClient: KalturaClient, private _appLocalization:AppLocalization, private _uploadManagement : UploadManagement)
    {
        super(manager);
	    this._trackUploadFiles();
    }

	private _trackUploadFiles() : void
	{
		this._uploadManagement.trackedFiles
			.cancelOnDestroy(this)
			.subscribe(
				((filesStatus : FileChanges) =>
				{
					this._captions.getValue().items.forEach(file =>
					{
						const uploadToken = (<any>file).uploadToken;
						if (uploadToken)
						{
							const uploadStatus = filesStatus[uploadToken];
							switch(uploadStatus ? uploadStatus.status : '')
							{
								case 'uploaded':
									(<any>file).uploading = false;
									(<any>file).uploadFailure = false;
									break;
								case 'uploadFailure':
									(<any>file).uploading = false;
									(<any>file).uploadFailure = true;
									break;
								case 'uploading':
									(<any>file).progress = (filesStatus[uploadToken].progress * 100).toFixed(0);
									if (filesStatus[uploadToken].progress<1) {
										(<any>file).uploading = true;
										(<any>file).uploadFailure = false;
									}
								default:
									break;
							}
						}
					});
				})
			);
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
	    this.captionsListDiffer = null;
	    this.captionDiffer = {};
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
			    filter: new KalturaAssetFilter({
					entryIdEqual : this._entryId
				})
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
		    case KalturaCaptionType.srt.toString():
		    	type = "SRT";
			    break;
		    case KalturaCaptionType.dfxp.toString():
		    	type = "DFXP";
			    break;
		    case KalturaCaptionType.webvtt.toString():
		    	type = "WEBVTT";
			    break;
	    }
	    return type;
    }

    public _getCaptionStatus(caption: any): string{
	    let status = "";
	    if (caption.status) {
		    status = this._appLocalization.get('applications.content.entryDetails.captions.processing');
		    switch (caption.status.toString()) {
			    case KalturaCaptionAssetStatus.error.toString():
				    status = this._appLocalization.get('applications.content.entryDetails.captions.error');
				    break;
			    case KalturaCaptionAssetStatus.ready.toString():
				    status = this._appLocalization.get('applications.content.entryDetails.captions.saved');
				    break;
		    }
	    }else{
		    if ((caption.uploadToken && caption.uploadToken.length) || (caption.uploadUrl && caption.uploadUrl.length)){
			    status = this._appLocalization.get('applications.content.entryDetails.captions.ready');
		    }
	    }
	    return status;
    }

    public _addCaption(): any{

		let newCaption: CaptionRow = {
			uploading: false,
			uploadToken: "",
			uploadUrl: "",
			id: null,
			format: KalturaCaptionType.srt,
	        language: KalturaLanguage.en,
	        label: "English",
	        isDefault: 0
		};

	    let captions = Array.from(this._captions.getValue().items); // create a copy of the captions array without a reference to the original array
	    captions.push(newCaption);
	    this._captions.next({items : captions, loading : false, error : null});
	    this.currentCaption = newCaption;
	}

	public upload(captionFile: File):void{
		this.currentCaption.uploading = true;
		this._uploadManagement.newUpload(new KalturaOVPFile(captionFile))
			.subscribe((response) => {
					// update file with actual upload token
					this.currentCaption.uploadToken = response.uploadToken;
					this.currentCaption.uploading = false;
				},
				(error) => {
					this.currentCaption.uploading = false;
					(<any>this.currentCaption).uploadFailure = true;
				});
	}

	public removeCaption(): void{
		// update the list by filtering the assets array.
		this._captions.next({items : this._captions.getValue().items.filter((item: CaptionRow) => {return item !== this.currentCaption}), loading : false});

		// stop tracking changes on this asset
		if (this.currentCaption.id && this.captionDiffer[this.currentCaption.id]){
			delete this.captionDiffer[this.currentCaption.id];
		}
	}

	// cleanup of added captions that don't have assets (url or uploaded file)
	public removeEmptyCaptions(){
		if (this.currentCaption) {
			if (this.currentCaption.id === null && this.currentCaption.uploadUrl === "" && this.currentCaption.uploadToken === "" && !this.currentCaption.uploading) {
				let captions = Array.from(this._captions.getValue().items); // create a copy of the captions array without a reference to the original array
				captions.pop(); // remove last caption
				this._captions.next({items : captions, loading : false, error : null});
			}
		}
	}

	// animate uploading caption row
    public _getRowStyle(rowData, rowIndex): string{
	    return rowData.uploading ? "uploading" : rowData.uploadFailure ? "uploadFailure" : '';
    }

    // save data
	protected _onDataSaving(data: KalturaMediaEntry, request: KalturaMultiRequest)
	{
		if ( this._captions.getValue().items ) {

			// check for added and removed captions
			if (this.captionsListDiffer) {
				let changes = this.captionsListDiffer.diff(this._captions.getValue().items);
				if (changes) {
					changes.forEachAddedItem((record: CollectionChangeRecord) => {
						// added captions
						let captionAsset = new KalturaCaptionAsset({language: record.item.language, format: record.item.format, label: record.item.label, isDefault: 0});
						const addCaptionRequest: CaptionAssetAddAction = new CaptionAssetAddAction({entryId: this.data.id, captionAsset: captionAsset});
						request.requests.push(addCaptionRequest);

						let resource = null;
						if ((record.item as CaptionRow).uploadUrl){ // add new caption from URL
							resource = new KalturaUrlResource({
								url :  (record.item as CaptionRow).uploadUrl
							});
						}
						if ((record.item as CaptionRow).uploadToken){ // add new caption from upload token
							resource = new KalturaUploadedFileTokenResource({
								token : (record.item as CaptionRow).uploadToken
							});
						}
						if (resource){
							let setContentRequest: CaptionAssetSetContentAction = new CaptionAssetSetContentAction({id: '0', contentResource: resource})
								.setDependency(['id', (request.requests.length), 'id']);
							console.warn("Warning: should be request.requests.length-1 after KAPI fix!");

							request.requests.push(setContentRequest);
						}
					});
					changes.forEachRemovedItem((record: CollectionChangeRecord) => {
						// remove deleted captions
						const deleteCaptionRequest: CaptionAssetDeleteAction = new CaptionAssetDeleteAction({captionAssetId: (record.item as CaptionRow).id});
						request.requests.push(deleteCaptionRequest);
					});
				}
			}

			// update changed captions and setting default caption
			this._captions.getValue().items.forEach((caption: any) => {
				let captionDiffer = this.captionDiffer[caption.id];
				if (captionDiffer) {
					let objChanges = captionDiffer.diff(caption);
					if (objChanges) {
						let updatedCaptionIDs = []; // array holding changed caption IDs. Used to verify we update each caption only once even if more than one fields was updated
						objChanges.forEachChangedItem((record: KeyValueChangeRecord) => {
							// update default caption if changed
							if (record.key === "isDefault" && record.currentValue === 1) {
								const setAsDefaultRequest: CaptionAssetSetAsDefaultAction = new CaptionAssetSetAsDefaultAction({captionAssetId: caption.id});
								request.requests.push(setAsDefaultRequest);
							} else {
								// update other fields
								if (updatedCaptionIDs.indexOf(caption.id) === -1) { // make sure we update each caption only once as we update all changed fields at once
									updatedCaptionIDs.push(caption.id);
									const updateCaptionRequest: CaptionAssetUpdateAction = new CaptionAssetUpdateAction({ id: caption.id, captionAsset: caption });
									request.requests.push(updateCaptionRequest);
								}
							}
						});
					}
				}
			});
		}
	}

}
