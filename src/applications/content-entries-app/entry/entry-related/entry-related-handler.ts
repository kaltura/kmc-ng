import { Injectable } from '@angular/core';
import { KeyValueDiffers, KeyValueDiffer,  IterableDiffers, IterableDiffer, IterableChangeRecord } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { KalturaMultiRequest } from 'kaltura-typescript-client';
import { AppAuthentication } from 'app-shared/kmc-shell';
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
import { BrowserService } from 'app-shared/kmc-shell';

import { EntryFormWidget } from '../entry-form-widget';
import { EntryWidgetKeys } from '../entry-widget-keys';
import { KalturaUploadFile } from '@kaltura-ng/kaltura-server-utils';

import { FriendlyHashId } from '@kaltura-ng/kaltura-common/friendly-hash-id';

import '@kaltura-ng/kaltura-common/rxjs/add/operators'
import { environment } from 'app-environment';
import { UploadManagement, TrackedFile } from '@kaltura-ng/kaltura-common';

export interface RelatedFile extends KalturaAttachmentAsset
{
    uploading?: boolean,
	tempId? : string;
    uploadToken?: string,
    uploadFailure? : boolean,
    progress? : string;
}

@Injectable()
export class EntryRelatedHandler extends EntryFormWidget
{

	relatedFilesListDiffer: IterableDiffer<RelatedFile>;
	relatedFileDiffer : { [key : string] : KeyValueDiffer<string,any> } = {};

	private _relatedFiles = new BehaviorSubject<{ items : RelatedFile[]}>(
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


    private _trackUploadFiles() : void {
        this._uploadManagement.onTrackFileChange$
            .cancelOnDestroy(this)
            .subscribe(
                ((trackedFile: TrackedFile) => {
                    const relatedFiles = this._relatedFiles.getValue().items;
                    const relevantRelatedFile = relatedFiles ? relatedFiles.find(file => file.uploadToken === trackedFile.uploadToken) : null;

                    if (relevantRelatedFile) {
                        switch (trackedFile.status) {
                            case 'uploaded':
                                relevantRelatedFile.uploading = false;
                                relevantRelatedFile.uploadFailure = false;
                                break;
                            case 'uploadFailure':
                                relevantRelatedFile.uploading = false;
                                relevantRelatedFile.uploadFailure = true;
                                break;
                            case 'uploading':
                                relevantRelatedFile.progress = (trackedFile.progress * 100).toFixed(0);
                                relevantRelatedFile.uploading = true;
                                relevantRelatedFile.uploadFailure = false;
                            default:
                                break;
                        }
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
					response.objects.forEach((asset: RelatedFile) => {
						if (!asset.format && asset.fileExt){
							asset.format = this._getFormatByExtension(asset.fileExt);
						}
					});
					this._relatedFiles.next({items : response.objects});
					this.relatedFilesListDiffer = this._listDiffers.find([]).create();
					this.relatedFilesListDiffer.diff(this._relatedFiles.getValue().items);

					this.relatedFileDiffer = {};
					this._relatedFiles.getValue().items.forEach((asset: RelatedFile) => {
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
					changes.forEachAddedItem((record: IterableChangeRecord<RelatedFile>) => {
						// added assets
						let newAsset:RelatedFile = record.item as RelatedFile;
						const addAssetRequest: AttachmentAssetAddAction = new AttachmentAssetAddAction({entryId: this.data.id, attachmentAsset: newAsset});
						request.requests.push(addAssetRequest);

						let resource = new KalturaUploadedFileTokenResource();
						resource.token = record.item["uploadToken"];
						let setContentRequest: AttachmentAssetSetContentAction = new AttachmentAssetSetContentAction({id: '0', contentResource: resource})
							.setDependency(['id', (request.requests.length-1), 'id']);

						request.requests.push(setContentRequest);

					});
					changes.forEachRemovedItem((record: IterableChangeRecord<RelatedFile>) => {
						// remove deleted assets
						const deleteAssetRequest: AttachmentAssetDeleteAction = new AttachmentAssetDeleteAction({attachmentAssetId: (record.item as RelatedFile).id});
						request.requests.push(deleteAssetRequest);
					});
				}
			}

			// update changed assets
			this._relatedFiles.getValue().items.forEach((asset: RelatedFile) => {
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


	private _addFile(fileName : string, format :KalturaAttachmentType) : RelatedFile {
    	const existingItems = this._relatedFiles.getValue().items;

		const newFile = new KalturaAttachmentAsset({
			filename: fileName,
			format: format
		});

		// create a fake id for local usage
		(newFile)['tempId'] = FriendlyHashId.defaultInstance.generateUnique(existingItems.map(item => item.id || (item).tempId));

		const files = [
			...existingItems,
			newFile
		];

		this._relatedFiles.next({items: files});

		this._setDirty();

		return newFile;
	}

	public _removeFile(file: RelatedFile): void{
		// update the list by filtering the assets array.

		this._relatedFiles.next({items : this._relatedFiles.getValue().items.filter((item: RelatedFile) => {return item !== file})});

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

	public downloadFile(file: RelatedFile): void{
		this._openFile(file.id, 'download');
	}

	public previewFile(file : RelatedFile): void{
		this._openFile(file.id, 'url');
	}

	private _updateFileUploadToken(file : RelatedFile, newUploadToken : string)
	{
		(file)['uploadToken'] = newUploadToken;
	}

	public _onFileSelected(selectedFiles: FileList) {
		if (selectedFiles && selectedFiles.length) {

			const fileData: File = selectedFiles[0];
			const extension = fileData.name.substr(fileData.name.lastIndexOf(".")+1);
			const newFile = this._addFile(fileData.name, this._getFormatByExtension(extension));
            (newFile).uploading = true;
			(<any>newFile).size = fileData.size; // we set type explicitly since size is readonly because it readonly


			this._uploadManagement.newUpload(new KalturaUploadFile(fileData))
                .subscribe((response) => {
						// update file with actual upload token
						this._updateFileUploadToken(newFile,response.uploadToken);
					},
					(error) => {
						(newFile).uploading = false;
						(newFile).uploadFailure = true;
					});
		}
	}

	public _cancelUpload(file: RelatedFile): void{
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
			case "mp4":
				format = KalturaAttachmentType.media;
				break;
			case "txt":
				format = KalturaAttachmentType.text;
				break;
			default:
				format = KalturaAttachmentType.document;
				break;
		}
		return format;
	}

	public _setDirty(){
		super._updateWidgetState({isDirty: true});
	}
}
