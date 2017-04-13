import { Injectable, } from '@angular/core';
import { EntrySection } from '../../entry-store/entry-section-handler';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import { ThumbAssetListAction, KalturaThumbAssetListResponse, KalturaThumbAsset, KalturaAssetFilter, DistributionProfileListAction, KalturaDistributionProfileListResponse,
	KalturaDistributionProfile, KalturaThumbAssetStatus, KalturaDistributionThumbDimensions } from '@kaltura-ng2/kaltura-api/types';
import { AppConfig, AppAuthentication } from '@kaltura-ng2/kaltura-common';

import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
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
	uploadStatus: boolean
}

@Injectable()
export class EntryThumbnailsHandler extends EntrySection
{
	private _thumbnails : BehaviorSubject<{ items : ThumbnailRow[], loading : boolean, error? : any}> = new BehaviorSubject<{ items : ThumbnailRow[], loading : boolean, error? : any}>(
		{ items : null, loading : false}
	);

	public _thumbnails$ = this._thumbnails.asObservable().monitor('thumbnail files');

    constructor(manager : EntrySectionsManager, private _kalturaServerClient: KalturaServerClient, private _appConfig: AppConfig, private _appAuthentication: AppAuthentication)
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

	    const getThumbnails$ = this._kalturaServerClient.request(new ThumbAssetListAction({ filter: new KalturaAssetFilter()
		    .setData(filter => {
				    filter.entryIdEqual = this.data.id;
			    })
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
				    const profiles = (responses[1] as KalturaDistributionProfileListResponse).objects || [];
				    this.buildThumbnailsData(thumbnails, profiles);
			    },
			    (error) => {
				    this._thumbnails.next({items : [], loading : false, error : error});
			    }
		    );
    }

    private buildThumbnailsData(thumbnails: KalturaThumbAsset[], profiles: KalturaDistributionProfile[]): void{
	    let thumbs: ThumbnailRow[] = [];
	    // create a ThumbnailRow data for each of the loaded thumbnails
	    thumbnails.forEach( (thumbnail: KalturaThumbAsset) => {
		    let thumb: ThumbnailRow = {id: thumbnail.id, status: thumbnail.status, width: thumbnail.width, height: thumbnail.height, size: thumbnail.size, isDefault: false, distributors: "", url: "", uploadStatus: false};
		    thumb.isDefault = thumbnail.tags.indexOf("default_thumb") > -1;
		    //thumb.distributors = this.getDistributors(thumb.width, thumb.height, profiles);
		    thumb.url = this._appConfig.get('core.kaltura.cdnUrl') +  "/api_v3/index.php/service/thumbasset/action/serve/ks/" + this._appAuthentication.appUser.ks + "/thumbAssetId/" + thumb.id ;
		    thumbs.push(thumb);
	    });
	    // create an empty ThumbnailRow data for each missing thumbnail dimension specified in any response profile
	    profiles.forEach((profile: KalturaDistributionProfile) => {
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
				    let missingThumb: ThumbnailRow = {id: "", status: KalturaThumbAssetStatus.Error, width: requiredWidth, height: requiredHeight, size: NaN, isDefault: false, distributors: profile.name, url: "", uploadStatus: false};
					thumbs.push(missingThumb);
			    }
		    });
	    });
	    this._thumbnails.next({items : thumbs, loading : false, error: null});
    }

	// animate uploading thumbnail row
	public _getRowStyle(rowData, rowIndex): string{
		return rowData.uploadStatus ? "uoloading" : '';
	}

	public _setAsDefault(thumb: ThumbnailRow):void{

	}
}
