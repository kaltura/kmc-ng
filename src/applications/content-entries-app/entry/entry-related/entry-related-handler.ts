import { Injectable, KeyValueDiffers, KeyValueDiffer,  IterableDiffers, IterableDiffer, CollectionChangeRecord } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { KalturaServerClient, KalturaMultiRequest } from '@kaltura-ng2/kaltura-api';
import { AppConfig, AppAuthentication } from '@kaltura-ng2/kaltura-common';
import { KalturaAssetFilter, KalturaAttachmentAsset, KalturaAttachmentType, AttachmentAssetListAction, KalturaUploadedFileTokenResource, AttachmentAssetSetContentAction,
	AttachmentAssetDeleteAction, AttachmentAssetUpdateAction, AttachmentAssetAddAction, KalturaMediaEntry } from '@kaltura-ng2/kaltura-api/types';
import { BrowserService } from 'kmc-shell';

import { EntrySection } from '../../entry-store/entry-section-handler';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import { EntrySectionsManager } from '../../entry-store/entry-sections-manager';
import { KalturaOVPFile } from '@kaltura-ng2/kaltura-common/upload-management/kaltura-ovp';
import { UploadManagement, FileChanges } from '@kaltura-ng2/kaltura-common/upload-management';
import { FriendlyHashId } from '@kaltura-ng2/kaltura-common/friendly-hash-id';

import '@kaltura-ng2/kaltura-common/rxjs/add/operators'

@Injectable()
export class EntryRelatedHandler extends EntrySection
{

	relatedFilesListDiffer: IterableDiffer;
	relatedFileDiffer : { [key : string] : KeyValueDiffer } = {};

	private _relatedFiles : BehaviorSubject<{ items : KalturaAttachmentAsset[], loading : boolean, error? : any}> = new BehaviorSubject<{ items : KalturaAttachmentAsset[], loading : boolean, error? : any}>(
		{ items : [], loading : false}
	);

	public _relatedFiles$ = this._relatedFiles.asObservable().monitor('related files');

	private _entryId: string = '';

	constructor(manager : EntrySectionsManager,
				private _appConfig: AppConfig,
				private _kalturaServerClient: KalturaServerClient,
	            private _browserService: BrowserService,
				private _appAuthentication: AppAuthentication,
				private _objectDiffers: KeyValueDiffers,
				private _listDiffers : IterableDiffers,
				private _uploadManagement : UploadManagement) {
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
                    this._relatedFiles.getValue().items.forEach(file =>
                    {
                        const uploadToken = (<any>file).uploadToken;
                        if (uploadToken)
                        {
                            const uploadStatus = filesStatus[uploadToken];
                            switch(uploadStatus ? uploadStatus.status : '')
                            {
                                case 'uploaded':
                                    (<any>file).uploading = false;
                                    break;
                                case 'uploadFailure':
                                    // TODO [kmcng] amir decide how to handle it
                                    break;
                                case 'uploading':
	                                (<any>file).progress = (filesStatus[uploadToken].progress * 100).toString();
                                default:
                                    break;
                            }
                        }
                    });
                    console.warn('TODO [kmcng]: check for relevant upload files');
                })
            );
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
		if (this._relatedFiles.getValue().items) {
			// check for added and removed assets
			if (this.relatedFilesListDiffer) {
				let changes = this.relatedFilesListDiffer.diff(this._relatedFiles.getValue().items);
				if (changes) {
					changes.forEachAddedItem((record: CollectionChangeRecord) => {
						// added assets
						let newAsset:KalturaAttachmentAsset = record.item as KalturaAttachmentAsset;
						const addAssetRequest: AttachmentAssetAddAction = new AttachmentAssetAddAction({entryId: this.data.id, attachmentAsset: newAsset});
						request.requests.push(addAssetRequest);

						let resource = new KalturaUploadedFileTokenResource();
						resource.token = record.item["uploadToken"];
						let setContentRequest: AttachmentAssetSetContentAction = new AttachmentAssetSetContentAction({id: '0', contentResource: resource})
							.setDependency(['id', (request.requests.length), 'id']); console.warn("Warning: should be request.requests.length-1 after KAPI fix!");

						request.requests.push(setContentRequest);

					});
					changes.forEachRemovedItem((record: CollectionChangeRecord) => {
						// remove deleted assets
						const deleteAssetRequest: AttachmentAssetDeleteAction = new AttachmentAssetDeleteAction({attachmentAssetId: (record.item as KalturaAttachmentAsset).id});
						request.requests.push(deleteAssetRequest);
					});
				}
			}

			// update changed assets
			this._relatedFiles.getValue().items.forEach((asset: KalturaAttachmentAsset) => {
				var relatedFileDiffer = this.relatedFileDiffer[asset.id];
				if (relatedFileDiffer) {
					var objChanges = relatedFileDiffer.diff(asset);
					if (objChanges) {
						const updateAssetRequest: AttachmentAssetUpdateAction = new AttachmentAssetUpdateAction({
							id: asset.id,
							attachmentAsset: asset
						});
						request.requests.push(updateAssetRequest);
					}
				}
			});
		}

	}


	private _addFile(fileName : string, format :KalturaAttachmentType) : KalturaAttachmentAsset {
    	const existingItems = this._relatedFiles.getValue().items;

		const newFile = new KalturaAttachmentAsset({
			filename: fileName,
			format: format
		});

		// create a fake id for local usage
		(<any>newFile)['tempId'] = FriendlyHashId.defaultInstance.generateUnique(existingItems.map(item => item.id || (<any>item).tempId));

		const files = [
			...existingItems,
			newFile
		];

		this._relatedFiles.next({items: files, loading: false});

		return newFile;
	}

	public removeFile(file: KalturaAttachmentAsset): void{
		// update the list by filtering the assets array.

		this._relatedFiles.next({items : this._relatedFiles.getValue().items.filter((item: KalturaAttachmentAsset) => {return item !== file}), loading : false});

		// stop tracking changes on this asset
		// if file id is empty it was added by the user so no need to track its changes.
		if (file.id && this.relatedFileDiffer[file.id]){
			delete this.relatedFileDiffer[file.id];
		}
	}

	private _openFile(fileId: string, operation: string): void {

		const baseUrl = this._appConfig.get('core.kaltura.cdnUrl');
		const protocol = baseUrl.split(":")[0];
		const partnerId = this._appAuthentication.appUser.partnerId;
		const entryId = this.data.id;

		let url = baseUrl + '/p/' + partnerId +'/sp/' + partnerId + '00/playManifest/entryId/' + entryId + '/flavorId/' + fileId + '/format/' + operation + '/protocol/' + protocol;

		this._browserService.openLink(url);
	}

	public downloadFile(file: KalturaAttachmentAsset): void{
		this._openFile(file.id, 'download');
	}

	public previewFile(file : KalturaAttachmentAsset): void{
		this._openFile(file.id, 'url');
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
									asset.format = KalturaAttachmentType.document;
									break;
								case "gif":
								case "png":
								case "jpg":
								case "jpeg":
								case "mp3":
									asset.format = KalturaAttachmentType.media;
									break;
								case "txt":
									asset.format = KalturaAttachmentType.text;
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

	private _updateFileUploadToken(file : KalturaAttachmentAsset, newUploadToken : string)
	{
		(<any>file)['uploadToken'] = newUploadToken;
	}

	public _onFileSelected(selectedFiles: FileList) {
		if (selectedFiles && selectedFiles.length) {
			const fileData: File = selectedFiles[0];

			const newFile = this._addFile(fileData.name, KalturaAttachmentType.document);
            (<any>newFile).uploading = true;

			this._uploadManagement.newUpload(new KalturaOVPFile(fileData))
                .subscribe((response) => {
						// update file with actual upload token
						this._updateFileUploadToken(newFile,response.uploadToken);
					},
					(error) => {
						// TODO [kmcng] implement logic decided with Product
						// remove file from list
						this.removeFile(newFile);
					});
		}
	}

	public _cancelUpload(file: KalturaAttachmentAsset): void{
		console.warn("Need to cancel http request");
		this.removeFile(file);
	}
}
