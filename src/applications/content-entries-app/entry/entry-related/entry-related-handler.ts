import { Injectable, KeyValueDiffers, KeyValueDiffer,  IterableDiffers, IterableDiffer, KeyValueChangeRecord, CollectionChangeRecord } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { AppLocalization, AppConfig, AppAuthentication } from '@kaltura-ng2/kaltura-common';
import { AttachmentAssetListAction } from '@kaltura-ng2/kaltura-api/services/attachment-asset';
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

	constructor(manager : EntrySectionsManager, private _appLocalization: AppLocalization, private _appConfig: AppConfig, private _kalturaServerClient: KalturaServerClient,
	            private _browserService: BrowserService, private _appAuthentication: AppAuthentication, private _objectDiffers:  KeyValueDiffers, private _listDiffers : IterableDiffers) {
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
				objChanges.forEachChangedItem((record: KeyValueChangeRecord) =>{
					console.log("detected change in "+ asset.id+ ": Changed field = " + record.key + ". New value = " + record.currentValue);
				});

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
								default:
									asset.format = -1; // allow change detection on the format field by initializing it to -1 if it doesn't exist on the retrieved asset data
									break;
							}
						}
						// apply empty string value for title and description if do not exist on retrieved asset data to allow change detection for these fields
						if (!asset.title){
							asset.title = "";
						}
						if (!asset.description){
							asset.description = "";
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
