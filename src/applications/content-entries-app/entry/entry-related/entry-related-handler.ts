import { Injectable, KeyValueDiffers, KeyValueDiffer,  IterableDiffers, IterableDiffer, KeyValueChangeRecord, CollectionChangeRecord } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { KalturaServerClient, KalturaMultiRequest } from '@kaltura-ng2/kaltura-api';
import { AppLocalization, AppConfig, AppAuthentication } from '@kaltura-ng2/kaltura-common';
import { KalturaAssetFilter, KalturaAttachmentAsset, KalturaAttachmentType, AttachmentAssetListAction,
	AttachmentAssetDeleteAction, AttachmentAssetUpdateAction, KalturaMediaEntry } from '@kaltura-ng2/kaltura-api/types';
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

	constructor(manager : EntrySectionsManager, private _appLocalization: AppLocalization, private _appConfig: AppConfig, private _kalturaServerClient: KalturaServerClient,
	            private _browserService: BrowserService, private _appAuthentication: AppAuthentication, private _objectDiffers: KeyValueDiffers, private _listDiffers : IterableDiffers) {
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

	protected _onDataSaving(data: KalturaMediaEntry, request: KalturaMultiRequest)
	{
		// check for added and removed assets
		let changes = this.relatedFilesListDiffer.diff(this._relatedFiles.getValue().items);
		if (changes) {
			changes.forEachAddedItem((record: CollectionChangeRecord) => {
				//console.log('added ' + (record.item as KalturaAttachmentAsset).id);
			});
			changes.forEachRemovedItem((record: CollectionChangeRecord) => {
				// remove deleted assets
				const deleteAssetRequest: AttachmentAssetDeleteAction = new AttachmentAssetDeleteAction({attachmentAssetId: (record.item as KalturaAttachmentAsset).id});
				request.requests.push(deleteAssetRequest);
			});
		}

		// update changed assets
		this._relatedFiles.getValue().items.forEach((asset: KalturaAttachmentAsset) => {
			var relatedFileDiffer = this.relatedFileDiffer[asset.id];
			var objChanges = relatedFileDiffer.diff(asset);
			if (objChanges) {
				const updateAssetRequest: AttachmentAssetUpdateAction = new AttachmentAssetUpdateAction({id: asset.id, attachmentAsset: asset});
				request.requests.push(updateAssetRequest);
				// objChanges.forEachChangedItem((record: KeyValueChangeRecord) =>{
				// 	console.log("detected change in "+ asset.id+ ": Changed field = " + record.key + ". New value = " + record.currentValue);
				// });

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

	private _openFile(fileId: string, operation: string): void {

		const baseUrl = this._appConfig.get('core.kaltura.cdnUrl');
		const protocol = baseUrl.split(":")[0];
		const partnerId = this._appAuthentication.appUser.partnerId;
		const entryId = this.data.id;

		let url = baseUrl + '/p/' + partnerId +'/sp/' + partnerId + '00/playManifest/entryId/' + entryId + '/flavorId/' + fileId + '/format/' + operation + '/protocol/' + protocol;
		url = url.replace("cdnapi","lbd"); // TODO [KMCNG] - remove this line once this feature is available on the production server (should be until April 7)

		this._browserService.openLink(url);
	}

	public _downloadFile(fileId: string): void{
		this._openFile(fileId, 'download');
	}

	public _previewFile(fileId: string): void{
		this._openFile(fileId, 'url');
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
					this.relatedFilesListDiffer = this._listDiffers.find([]).create(null);
					this.relatedFilesListDiffer.diff(this._relatedFiles.getValue().items);

					this.relatedFileDiffer = {};
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
