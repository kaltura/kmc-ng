import { Injectable, KeyValueDiffers, KeyValueDiffer,  IterableDiffers, IterableDiffer, CollectionChangeRecord } from '@angular/core';
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

@Injectable()
export class EntryRelatedHandler extends EntrySection
{

	relatedFilesListDiffer: IterableDiffer;
	relatedFileDiffer : { [key : string] : KeyValueDiffer } = {};

	private _relatedFiles : BehaviorSubject<{ items : KalturaAttachmentAsset[], loading : boolean, error? : any}> = new BehaviorSubject<{ items : KalturaAttachmentAsset[], loading : boolean, error? : any}>(
		{ items : null, loading : false}
	);

	public _relatedFiles$ = this._relatedFiles.asObservable().monitor('related files');

	private _entryId: string = '';

	constructor(manager : EntrySectionsManager, private _appLocalization: AppLocalization, private _kalturaServerClient: KalturaServerClient,
	            private _browserService: BrowserService, private _objectDiffers:  KeyValueDiffers, private _listDiffers : IterableDiffers) {
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

		console.log("---------> List changes <---------");
		let changes = this.relatedFilesListDiffer.diff(this._relatedFiles.getValue().items);
		if (changes) {
			changes.forEachAddedItem((record: CollectionChangeRecord) => {
				console.log('added ' + (record.item as KalturaAttachmentAsset).id);
			});
			changes.forEachRemovedItem((record: CollectionChangeRecord) => {
				console.log('removed ' + (record.item as KalturaAttachmentAsset).id);
			});
		}

		console.log("---------> Item changes <---------");
		this._relatedFiles.getValue().items.forEach((asset: KalturaAttachmentAsset) => {
			var relatedFileDiffer = this.relatedFileDiffer[asset.id];
			var objChanges = relatedFileDiffer.diff(asset);
			if (objChanges) {
				console.log("detected change in "+ asset.id+ ": " + objChanges);
			}
		});
	}

	public _deleteFile(fileId: string): void{
		// update the list by filtering the assets array. The filter filters out the deleted asset by its ID
		this._relatedFiles.next({items : this._relatedFiles.getValue().items.filter((item: KalturaAttachmentAsset) => {return item.id !== fileId}), loading : false});

		// stop tracking changes on this asset
		if (this.relatedFileDiffer[fileId]){
			delete this.relatedFileDiffer[fileId];
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
					this.relatedFileDiffer = {};
					this.relatedFilesListDiffer = this._listDiffers.find([]).create(null);
					this.relatedFilesListDiffer.diff(this._relatedFiles.getValue().items);

					this._relatedFiles.getValue().items.forEach((asset: KalturaAttachmentAsset) => {
						this.relatedFileDiffer[asset.id] = this._objectDiffers.find([]).create(null);
						this.relatedFileDiffer[asset.id].diff(asset);
					});
				},
				error =>
				{
					this._relatedFiles.next({items : [], loading : false, error : error});
				}
			);
	}
}
