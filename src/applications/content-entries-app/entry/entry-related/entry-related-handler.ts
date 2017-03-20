import { Injectable, KeyValueDiffers } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { AttachmentAssetListAction, AttachmentAssetGetUrlAction, AttachmentAssetServeAction } from '@kaltura-ng2/kaltura-api/services/attachment-asset';
import { KalturaAssetFilter, KalturaAttachmentAsset, KalturaAttachmentType } from '@kaltura-ng2/kaltura-api/types'
import { BrowserService } from 'kmc-shell';

import { EntrySection } from '../../entry-store/entry-section-handler';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import { EntrySectionsManager } from '../../entry-store/entry-sections-manager';

import '@kaltura-ng2/kaltura-common/rxjs/add/operators'

import * as R from 'ramda';

@Injectable()
export class EntryRelatedHandler extends EntrySection
{

	objDiffer = {};

	private _relatedFiles : BehaviorSubject<{ items : KalturaAttachmentAsset[], loading : boolean, error? : any}> = new BehaviorSubject<{ items : KalturaAttachmentAsset[], loading : boolean, error? : any}>(
		{ items : null, loading : false}
	);

	public _relatedFiles$ = this._relatedFiles.asObservable().monitor('related files');

	private _entryId: string = '';

	constructor(manager : EntrySectionsManager, private _appLocalization: AppLocalization, private _kalturaServerClient: KalturaServerClient, private _browserService: BrowserService, private differs:  KeyValueDiffers) {
        super(manager);
    }

    public get sectionType() : EntrySectionTypes
    {
        return EntrySectionTypes.Related;
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    protected _reset()
    {
    	this._entryId = '';
	    this._relatedFiles.next({ loading : false, items : [], error : null});
    }

	protected _activate(firstLoad : boolean) {
		this._entryId = this.data.id;
		this._fetchRelatedFiles();
	}

	logItems(){
		console.log(this._relatedFiles.getValue().items);
		console.log("------------------");
		this._relatedFiles.getValue().items.forEach((asset: KalturaAttachmentAsset) => {
			var objDiffer = this.objDiffer[asset.id];
			var objChanges = objDiffer.diff(asset);
			if (objChanges) {
				console.log("detected change: "+objChanges);
			}
		});
	}

	public _deleteFile(fileId: string): void{
		const deleteIndex = R.findIndex(R.propEq('id', fileId))(this._relatedFiles.getValue().items);
		if (deleteIndex > -1){
			this._relatedFiles.getValue().items.splice(deleteIndex, 1);
		}
		// stop tracking changes on this asset
		if (this.objDiffer[fileId]){
			delete this.objDiffer[fileId];
		}
	}

	public _downloadFile(fileId: string): void{
		this._kalturaServerClient.request(new AttachmentAssetGetUrlAction({id: fileId}))
			.cancelOnDestroy(this)
			.monitor('download related file asset ID: '+fileId)
			.subscribe(
				response =>
				{
					this._browserService.openLink(response);
				},
				error =>
				{
					console.log("Error getting asset download URL");
				}
			);
	}
	public _previewFile(fileId: string): void{
		// this._kalturaServerClient.request(new AttachmentAssetServeAction({id: fileId}))
		// 	.cancelOnDestroy(this)
		// 	.monitor('preview related file asset ID: '+fileId)
		// 	.subscribe(
		// 		response =>
		// 		{
		// 			this._browserService.openLink(response);
		// 		},
		// 		error =>
		// 		{
		// 			console.log("Error getting asset download URL");
		// 		}
		// 	);
	}

	private _fetchRelatedFiles(){
		this._relatedFiles.next({items : [], loading : true});


		this._kalturaServerClient.request(new AttachmentAssetListAction({
			filter: new KalturaAssetFilter()
				.setData(filter => {
					filter.entryIdEqual = this._entryId;
				})
			}))
			.cancelOnDestroy(this,this.sectionReset$)
			.monitor('get entry related files')
			.subscribe(
				response =>
				{
					// set file type
					response.objects.forEach((asset: KalturaAttachmentAsset) => {
						if (!asset.format && asset.fileExt){
							switch (asset.fileExt){
								case "doc":
								case "docx":
								case "dot":
								case "pdf":
								case "ppt":
								case "pps":
								case "xls":
								case "xlsx":
								case "xml":
									asset.format = KalturaAttachmentType.Document;
									break;
								case "gif":
								case "png":
								case "jpg":
								case "jpeg":
								case "mp3":
									asset.format = KalturaAttachmentType.Media;
									break;
								case "txt":
									asset.format = KalturaAttachmentType.Text;
									break;
							}
						}
					});
					this._relatedFiles.next({items : response.objects, loading : false});
					this.objDiffer = {};
					this._relatedFiles.getValue().items.forEach((asset: KalturaAttachmentAsset) => {
						this.objDiffer[asset.id] = this.differs.find([]).create(null);
						this.objDiffer[asset.id].diff(asset);
					});
				},
				error =>
				{
					this._relatedFiles.next({items : [], loading : false, error : error});
				}
			);
	}
}
