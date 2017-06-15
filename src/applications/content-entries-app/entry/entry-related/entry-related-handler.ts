import { Injectable } from '@angular/core';
import { KeyValueDiffers, KeyValueDiffer,  IterableDiffers, IterableDiffer, IterableChangeRecord } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { KalturaMultiRequest } from 'kaltura-typescript-client';
import { AppAuthentication } from '@kaltura-ng2/kaltura-common';
import { KalturaAssetFilter } from 'kaltura-typescript-client/types/KalturaAssetFilter';
import { KalturaAttachmentAsset } from 'kaltura-typescript-client/types/KalturaAttachmentAsset';
import { KalturaAttachmentType } from 'kaltura-typescript-client/types/KalturaAttachmentType';
import { AttachmentAssetListAction } from 'kaltura-typescript-client/types/AttachmentAssetListAction';
import { KalturaUploadedFileTokenResource } from 'kaltura-typescript-client/types/KalturaUploadedFileTokenResource';
import { AttachmentAssetSetContentAction } from 'kaltura-typescript-client/types/AttachmentAssetSetContentAction';
import { AttachmentAssetDeleteAction } from 'kaltura-typescript-client/types/AttachmentAssetDeleteAction';
import { AttachmentAssetUpdateAction } from 'kaltura-typescript-client/types/AttachmentAssetUpdateAction';
import { AttachmentAssetAddAction } from 'kaltura-typescript-client/types/AttachmentAssetAddAction';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { BrowserService } from 'kmc-shell';

import { EntryFormWidget } from '../entry-form-widget';
import { EntryWidgetKeys } from '../entry-widget-keys';
import { KalturaOVPFile } from '@kaltura-ng2/kaltura-common/upload-management/kaltura-ovp';
import { UploadManagement, FileChanges } from '@kaltura-ng2/kaltura-common/upload-management';
import { FriendlyHashId } from '@kaltura-ng2/kaltura-common/friendly-hash-id';

import '@kaltura-ng2/kaltura-common/rxjs/add/operators'
import { environment } from 'kmc-app';

@Injectable()
export class EntryRelatedHandler extends EntryFormWidget
{

	relatedFilesListDiffer: IterableDiffer<KalturaAttachmentAsset>;
	relatedFileDiffer : { [key : string] : KeyValueDiffer<string,any> } = {};

	private _relatedFiles = new BehaviorSubject<{ items : KalturaAttachmentAsset[]}>(
		{ items : []}
	);

	public _relatedFiles$ = this._relatedFiles.asObservable();

	private _entryId: string = '';

	constructor(
				private _kalturaServerClient: KalturaClient,
	            private _browserService: BrowserService,
				private _appAuthentication: AppAuthentication,
				private _objectDiffers: KeyValueDiffers,
				private _listDiffers : IterableDiffers,
				private _uploadManagement : UploadManagement) {
        super(EntryWidgetKeys.Related);
    }


    private _trackUploadFiles() : void
    {
	    console.warn("[kmcng] - should track files only when uploading new files");
        this._uploadManagement.trackedFiles
            .cancelOnDestroy(this)
            .subscribe(
                ((filesStatus : FileChanges) =>
                {
	                let uploading = false;
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
	                                (<any>file).uploadFailure = false;
                                    break;
                                case 'uploadFailure':
	                                (<any>file).uploading = false;
	                                (<any>file).uploadFailure = true;
                                    break;
                                case 'uploading':
	                                (<any>file).progress = (filesStatus[uploadToken].progress * 100).toFixed(0);
	                                (<any>file).uploading = true;
	                                (<any>file).uploadFailure = false;
		                            uploading = true;
                                default:
                                    break;
                            }
                        }
                    });

	                if (this.isBusy !== uploading) {
		                super._updateWidgetState({isBusy: uploading});
	                }
                })
            );
    }


    /**
     * Do some cleanups if needed once the section is removed
     */
    protected _onReset()
    {
	    this.relatedFileDiffer = {};
	    this.relatedFilesListDiffer = null;
    	this._entryId = '';
	    this._relatedFiles.next({ items : [] });
    }

	protected _onActivate(firstTimeActivating: boolean) {
		this._entryId = this.data.id;
		super._showLoader();

		if (firstTimeActivating)
		{
			this._trackUploadFiles();
		}

		this._relatedFiles.next({items : []});

		return this._kalturaServerClient.request(new AttachmentAssetListAction({
			filter: new KalturaAssetFilter(
				{
					entryIdEqual : this._entryId
				}
			)}))
			.cancelOnDestroy(this,this.widgetReset$)
			.monitor('get entry related files')
			.do(
				response =>
				{
					// set file type
					response.objects.forEach((asset: KalturaAttachmentAsset) => {
						if (!asset.format && asset.fileExt){
							asset.format = this._getFormatByExtension(asset.fileExt);
						}
					});
					this._relatedFiles.next({items : response.objects});
					this.relatedFilesListDiffer = this._listDiffers.find([]).create();
					this.relatedFilesListDiffer.diff(this._relatedFiles.getValue().items);

					this.relatedFileDiffer = {};
					this._relatedFiles.getValue().items.forEach((asset: KalturaAttachmentAsset) => {
						this.relatedFileDiffer[asset.id] = this._objectDiffers.find([]).create(null);
						this.relatedFileDiffer[asset.id].diff(asset);
					});
					super._hideLoader();
				})
			.catch((error, caught) =>
				{
					this._relatedFiles.next({items : []});
					super._hideLoader();
					super._showActivationError();
					return Observable.throw(error);
				}
			);
	}

	protected _onDataSaving(data: KalturaMediaEntry, request: KalturaMultiRequest)
	{
		if (this._relatedFiles.getValue().items) {
			// check for added and removed assets
			if (this.relatedFilesListDiffer) {
				let changes = this.relatedFilesListDiffer.diff(this._relatedFiles.getValue().items);
				if (changes) {
					changes.forEachAddedItem((record: IterableChangeRecord<KalturaAttachmentAsset>) => {
						// added assets
						let newAsset:KalturaAttachmentAsset = record.item as KalturaAttachmentAsset;
						const addAssetRequest: AttachmentAssetAddAction = new AttachmentAssetAddAction({entryId: this.data.id, attachmentAsset: newAsset});
						request.requests.push(addAssetRequest);

						let resource = new KalturaUploadedFileTokenResource();
						resource.token = record.item["uploadToken"];
						let setContentRequest: AttachmentAssetSetContentAction = new AttachmentAssetSetContentAction({id: '0', contentResource: resource})
							.setDependency(['id', (request.requests.length-1), 'id']);

						request.requests.push(setContentRequest);

					});
					changes.forEachRemovedItem((record: IterableChangeRecord<KalturaAttachmentAsset>) => {
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

		this._relatedFiles.next({items: files});

		this._setDirty();

		return newFile;
	}

	public _removeFile(file: KalturaAttachmentAsset): void{
		// update the list by filtering the assets array.

		this._relatedFiles.next({items : this._relatedFiles.getValue().items.filter((item: KalturaAttachmentAsset) => {return item !== file})});

		// stop tracking changes on this asset
		// if file id is empty it was added by the user so no need to track its changes.
		if (file.id && this.relatedFileDiffer[file.id]){
			delete this.relatedFileDiffer[file.id];
		}

		this._setDirty();
	}

	private _openFile(fileId: string, operation: string): void {

		const baseUrl = environment.core.kaltura.cdnUrl;
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
						(<any>newFile).uploading = false;
						(<any>newFile).uploadFailure = true;
					});
		}
	}

	public _cancelUpload(file: KalturaAttachmentAsset): void{
		console.warn("Need to cancel http request");
		this._removeFile(file);
	}

	private _getFormatByExtension(ext: string): KalturaAttachmentType{
		let format : KalturaAttachmentType = null;
		switch (ext) {
			case "doc":
			case "docx":
			case "dot":
			case "pdf":
			case "ppt":
			case "pps":
			case "xls":
			case "xlsx":
			case "xml":
				format = KalturaAttachmentType.document;
				break;
			case "gif":
			case "png":
			case "jpg":
			case "jpeg":
			case "mp3":
				format = KalturaAttachmentType.media;
				break;
			case "txt":
				format = KalturaAttachmentType.text;
				break;
		}
		return format;
	}

	public _setDirty(){
		super._updateWidgetState({isDirty: true});
	}
}
