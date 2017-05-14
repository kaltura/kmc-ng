import { Injectable, } from '@angular/core';
import { EntrySection } from '../../entry-store/entry-section-handler';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import { ThumbAssetListAction, ThumbAssetSetAsDefaultAction, KalturaThumbAssetListResponse, KalturaThumbAsset, KalturaAssetFilter, DistributionProfileListAction, KalturaDistributionProfileListResponse,
	KalturaDistributionProfile, KalturaThumbAssetStatus, KalturaDistributionThumbDimensions, ThumbAssetDeleteAction, ThumbAssetAddFromImageAction } from 'kaltura-typescript-client/types/all';
import { AppConfig, AppAuthentication } from '@kaltura-ng2/kaltura-common';

import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { EntrySectionsManager } from '../../entry-store/entry-sections-manager';

export interface ThumbnailRow {
	id: string,
	width: number,
	height: number,
	size: number,
	distributors: string,
	isDefault: boolean,
	url: string,
	status: KalturaThumbAssetStatus,
	uploadStatus: boolean,
	fileExt: string
}

@Injectable()
export class EntryThumbnailsHandler extends EntrySection
{
	private _thumbnails : BehaviorSubject<{ items : ThumbnailRow[], loading : boolean, error? : any}> = new BehaviorSubject<{ items : ThumbnailRow[], loading : boolean, error? : any}>(
		{ items : null, loading : false}
	);

	public _thumbnails$ = this._thumbnails.asObservable();
	private _distributionProfiles: KalturaDistributionProfile[]; // used to save the response profiles array as it is loaded only once

    constructor(manager : EntrySectionsManager, private _kalturaServerClient: KalturaClient, private _appConfig: AppConfig, private _appAuthentication: AppAuthentication)
    {
        super(manager);
    }

    public get sectionType() : EntrySectionTypes
    {
        return EntrySectionTypes.Thumbnails;
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    protected _reset()
    {
    }

    protected _activate(firstLoad : boolean) {
	    this.fetchThumbnailsAndDistributions();
    }

    private fetchThumbnailsAndDistributions(): void{

	    this._thumbnails.next({items : [], loading : true});

	    const getThumbnails$ = this._kalturaServerClient.request(new ThumbAssetListAction(
	    	{
	    		filter: new KalturaAssetFilter(
	    			{
						entryIdEqual : this.data.id
					}
				)
	    	}))
		    .cancelOnDestroy(this,this.sectionReset$)
		    .monitor('get thumbnails');

	    const getProfiles$ = this._kalturaServerClient.request(new DistributionProfileListAction({}))
		    .cancelOnDestroy(this,this.sectionReset$)
		    .monitor('get distribution profiles');


	    Observable.forkJoin(getThumbnails$, getProfiles$)
		    .subscribe(
			    (responses) => {
				    const thumbnails = (responses[0] as KalturaThumbAssetListResponse).objects || [];
				    this._distributionProfiles = (responses[1] as KalturaDistributionProfileListResponse).objects || [];
				    this.buildThumbnailsData(thumbnails);
			    },
			    (error) => {
				    this._thumbnails.next({items : [], loading : false, error : error});
			    }
		    );
    }

    private buildThumbnailsData(thumbnails: KalturaThumbAsset[]): void{
	    let thumbs: ThumbnailRow[] = [];
	    // create a ThumbnailRow data for each of the loaded thumbnails
	    thumbnails.forEach( (thumbnail: KalturaThumbAsset) => {
		    if (thumbnail.status.toString() === KalturaThumbAssetStatus.ready.toString()) {
			    let thumb: ThumbnailRow = {
				    id: thumbnail.id,
				    status: thumbnail.status,
				    width: thumbnail.width,
				    height: thumbnail.height,
				    size: thumbnail.size,
				    isDefault: false,
				    distributors: "",
				    url: "",
				    uploadStatus: false,
				    fileExt: thumbnail.fileExt
			    };
			    thumb.isDefault = thumbnail.tags.indexOf("default_thumb") > -1;
			    thumb.url = this._appConfig.get('core.kaltura.cdnUrl') + "/api_v3/index.php/service/thumbasset/action/serve/ks/" + this._appAuthentication.appUser.ks + "/thumbAssetId/" + thumb.id;
			    thumbs.push(thumb);
		    }
	    });
	    // create an empty ThumbnailRow data for each missing thumbnail dimension specified in any response profile
	    this._distributionProfiles.forEach((profile: KalturaDistributionProfile) => {
		    const requiredThumbDimensions : KalturaDistributionThumbDimensions[] = profile.requiredThumbDimensions;
		    requiredThumbDimensions.forEach((dimensions: KalturaDistributionThumbDimensions) => {
			    const requiredWidth = dimensions.width;
			    const requiredHeight = dimensions.height;
			    let foundCorrespondingThumbnail = false;
			    thumbs.forEach( (thumbnail: ThumbnailRow) => {
				    // found thumbnail with the required dimensions - add the distrubution name to the thumbnail distributors
					if (thumbnail.width === requiredWidth && thumbnail.height === requiredHeight){
						foundCorrespondingThumbnail = true;
						thumbnail.distributors = thumbnail.distributors.length > 0 ? thumbnail.distributors + ", " + profile.name : profile.name;
					}
			    });
			    if (!foundCorrespondingThumbnail){
				    // create a new missing thumb placeholder and append it to the thumbnails array
				    let missingThumb: ThumbnailRow = {id: "", status: KalturaThumbAssetStatus.error, width: requiredWidth, height: requiredHeight, size: NaN, isDefault: false, distributors: profile.name, url: "", uploadStatus: false, fileExt: ""};
					thumbs.push(missingThumb);
			    }
		    });
	    });
	    this._thumbnails.next({items : thumbs, loading : false, error: null});
    }

    private reloadThumbnails(){
	    const thumbs = Array.from(this._thumbnails.getValue().items);
	    this._kalturaServerClient.request(new ThumbAssetListAction({ filter: new KalturaAssetFilter({
			entryIdEqual : this.data.id
		})}))
	    .cancelOnDestroy(this,this.sectionReset$)
	    .monitor('get thumbnails')
	    .subscribe(
			    (responses) => {
				    const thumbnails = (responses as KalturaThumbAssetListResponse).objects || [];
				    this.buildThumbnailsData(thumbnails);
			    },
			    (error) => {
				    this._thumbnails.next({items : thumbs, loading : false, error : error});
			    }
		    );
    }

	// animate uploading thumbnail row
	public _getRowStyle(rowData, rowIndex): string{
		return rowData.uploadStatus ? "uoloading" : '';
	}

	public _setAsDefault(thumb: ThumbnailRow):void{
		const thumbs = Array.from(this._thumbnails.getValue().items);
		this._thumbnails.next({items : thumbs, loading : true});
		this._kalturaServerClient.request(new ThumbAssetSetAsDefaultAction({thumbAssetId: thumb.id}))
			.cancelOnDestroy(this,this.sectionReset$)
			.monitor('set thumb as default')
			.subscribe(
				() =>
				{
					thumbs.forEach(thumb =>{
						thumb.isDefault = false;
					});
					thumb.isDefault = true;
					this._thumbnails.next({items : thumbs, loading : false});
				},
				error =>
				{
					this._thumbnails.next({items : thumbs, loading : false, error: error});
				}
			);
	}

	public deleteThumbnail(id: string): void{
		const thumbs = Array.from(this._thumbnails.getValue().items);
		this._thumbnails.next({items : thumbs, loading : true});
		this._kalturaServerClient.request(new ThumbAssetDeleteAction({thumbAssetId: id}))
			.cancelOnDestroy(this,this.sectionReset$)
			.monitor('delete thumb')
			.subscribe(
				() =>
				{
					this.reloadThumbnails();
				},
				error =>
				{
					this._thumbnails.next({items : thumbs, loading : false, error: error});
				}
			);
	}

	public _onFileSelected(selectedFiles: FileList) {
		if (selectedFiles && selectedFiles.length) {
			const fileData: File = selectedFiles[0];

			const thumbs = Array.from(this._thumbnails.getValue().items);
			this._thumbnails.next({items: thumbs, loading: true});
			this._kalturaServerClient.request(new ThumbAssetAddFromImageAction({
				entryId: this.data.id,
				fileData: fileData
			}))
                .cancelOnDestroy(this, this.sectionReset$)
                .monitor('add thumb')
                .subscribe(
					() => {
						this.reloadThumbnails();
					},
					error => {
						this._thumbnails.next({items : thumbs, loading : false, error: error});
					}
				);
		}
	}

	public closeError(): void{
		const thumbs = Array.from(this._thumbnails.getValue().items);
		this._thumbnails.next({items : thumbs, loading : false, error: false});
	}
}
