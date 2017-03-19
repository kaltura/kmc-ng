import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { AttachmentAssetListAction } from '@kaltura-ng2/kaltura-api/services/attachment-asset';
import { KalturaAssetFilter, KalturaAttachmentAsset, KalturaAttachmentType } from '@kaltura-ng2/kaltura-api/types'

import { EntrySection } from '../../entry-store/entry-section-handler';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import { EntrySectionsManager } from '../../entry-store/entry-sections-manager';

import '@kaltura-ng2/kaltura-common/rxjs/add/operators'

@Injectable()
export class EntryRelatedHandler extends EntrySection
{

	private _relatedFiles : BehaviorSubject<{ items : KalturaAttachmentAsset[], loading : boolean, error? : any}> = new BehaviorSubject<{ items : KalturaAttachmentAsset[], loading : boolean, error? : any}>(
		{ items : null, loading : false}
	);

	public _relatedFiles$ = this._relatedFiles.asObservable().monitor('related files');

	private _originalRelatedFiles = [];
	private _entryId: string = '';

	constructor(manager : EntrySectionsManager, private _appLocalization: AppLocalization, private _kalturaServerClient: KalturaServerClient) {
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
				},
				error =>
				{
					this._relatedFiles.next({items : [], loading : false, error : error});
				}
			);
	}
}
