import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import { ThumbAssetListAction } from 'kaltura-typescript-client/types/ThumbAssetListAction';
import { ThumbAssetSetAsDefaultAction } from 'kaltura-typescript-client/types/ThumbAssetSetAsDefaultAction';
import { KalturaThumbAssetListResponse } from 'kaltura-typescript-client/types/KalturaThumbAssetListResponse';
import { KalturaThumbAsset } from 'kaltura-typescript-client/types/KalturaThumbAsset';
import { KalturaAssetFilter } from 'kaltura-typescript-client/types/KalturaAssetFilter';
import { DistributionProfileListAction } from 'kaltura-typescript-client/types/DistributionProfileListAction';
import { KalturaDistributionProfileListResponse } from 'kaltura-typescript-client/types/KalturaDistributionProfileListResponse';
import { KalturaDistributionProfile } from 'kaltura-typescript-client/types/KalturaDistributionProfile';
import { KalturaThumbAssetStatus } from 'kaltura-typescript-client/types/KalturaThumbAssetStatus';
import { KalturaDistributionThumbDimensions } from 'kaltura-typescript-client/types/KalturaDistributionThumbDimensions';
import { ThumbAssetDeleteAction } from 'kaltura-typescript-client/types/ThumbAssetDeleteAction';
import { ThumbAssetAddFromImageAction } from 'kaltura-typescript-client/types/ThumbAssetAddFromImageAction';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';

import { EntryWidgetKeys } from '../entry-widget-keys';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { environment } from 'app-environment';
import { PreviewMetadataChangedEvent } from '../../preview-metadata-changed-event';
import { AppEventsService } from 'app-shared/kmc-shared';
import { EntryWidget } from '../entry-widget';

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
export class EntryThumbnailsWidget extends EntryWidget
{
	private _thumbnails = new BehaviorSubject<{ items : ThumbnailRow[]}>(
		{ items : []}
	);

	public _thumbnails$ = this._thumbnails.asObservable();
	private _distributionProfiles: KalturaDistributionProfile[]; // used to save the response profiles array as it is loaded only once

    constructor( private _kalturaServerClient: KalturaClient, private _appAuthentication: AppAuthentication,
                private _appLocalization: AppLocalization, private _appEvents: AppEventsService)
    {
        super(EntryWidgetKeys.Thumbnails);
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    protected onReset()
    {
    }

    protected onActivate(firstTimeActivating: boolean) {

	    super._showLoader();

	    this._thumbnails.next({items : []});

	    const getThumbnails$ = this._kalturaServerClient.request(new ThumbAssetListAction(
		    {
			    filter: new KalturaAssetFilter(
				    {
					    entryIdEqual : this.data.id
				    }
			    )
		    }))
		    .monitor('get thumbnails');

	    const getProfiles$ = this._kalturaServerClient.request(new DistributionProfileListAction({}))
		    .monitor('get distribution profiles');


	    return Observable.forkJoin(getThumbnails$, getProfiles$)
		    .cancelOnDestroy(this,this.widgetReset$)

		    .catch((error, caught) =>
		    {
			    super._hideLoader();
			    super._showActivationError();
			    this._thumbnails.next({items : []});
			    return Observable.throw(error);
		    })
		    .do(responses => {
			    const thumbnails = (responses[0] as KalturaThumbAssetListResponse).objects || [];
			    this._distributionProfiles = (responses[1] as KalturaDistributionProfileListResponse).objects || [];
			    this.buildThumbnailsData(thumbnails);
			    super._hideLoader();
		    });

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
			    thumb.url = environment.core.kaltura.cdnUrl + "/api_v3/index.php/service/thumbasset/action/serve/ks/" + this._appAuthentication.appUser.ks + "/thumbAssetId/" + thumb.id;
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
	    this._thumbnails.next({items : thumbs});
    }

    private reloadThumbnails(){
	    super._showLoader();
	    const thumbs = Array.from(this._thumbnails.getValue().items);
	    this._kalturaServerClient.request(new ThumbAssetListAction({ filter: new KalturaAssetFilter({
			entryIdEqual : this.data.id
		})}))
	    .cancelOnDestroy(this,this.widgetReset$)
	    .monitor('reload thumbnails')
	    .subscribe(
			    (responses) => {
				    const thumbnails = (responses as KalturaThumbAssetListResponse).objects || [];
				    this.buildThumbnailsData(thumbnails);
				    super._hideLoader();
			    },
			    (error) => {
				    super._hideLoader();
				    this._showBlockerMessage(new AreaBlockerMessage(
					    {
						    message: this._appLocalization.get('applications.content.entryDetails.errors.thumbnailsError'),
						    buttons: [
							    {
								    label: this._appLocalization.get('applications.content.entryDetails.errors.reload'),
								    action: () => {
									    this.reloadThumbnails();
								    }
							    }
						    ]
					    }
				    ), true);
			    }
		    );
    }

	// animate uploading thumbnail row
	public _getRowStyle(rowData, rowIndex): string{
		return rowData.uploadStatus ? "uoloading" : '';
	}

	public _setAsDefault(thumb: ThumbnailRow):void{
		const thumbs = Array.from(this._thumbnails.getValue().items);
		super._showLoader();

		const entryId = this.data ? this.data.id : null;

		this._kalturaServerClient.request(new ThumbAssetSetAsDefaultAction({thumbAssetId: thumb.id}))
			.cancelOnDestroy(this,this.widgetReset$)
			.monitor('set thumb as default')
			.subscribe(
				() =>
				{
					thumbs.forEach(thumb =>{
						thumb.isDefault = false;
					});
					thumb.isDefault = true;

					if (entryId) {
                        this._appEvents.publish(new PreviewMetadataChangedEvent(entryId));
                    }

					super._hideLoader();
				},
				error =>
				{
					super._hideLoader();
					this._showBlockerMessage(new AreaBlockerMessage(
						{
							message: 'Error setting default thumb',
							buttons: [
								{
									label: 'Retry',
									action: () => {
										this._setAsDefault(thumb);
									}
								}
							]
						}
					), true);
				}
			);
	}

	public deleteThumbnail(id: string): void{
		const thumbs = Array.from(this._thumbnails.getValue().items);
		super._showLoader();
		this._kalturaServerClient.request(new ThumbAssetDeleteAction({thumbAssetId: id}))
			.cancelOnDestroy(this,this.widgetReset$)
			.monitor('delete thumb')
			.subscribe(
				() =>
				{
					super._hideLoader();
					this.reloadThumbnails();
				},
				error =>
				{
					super._hideLoader();
					this._showBlockerMessage(new AreaBlockerMessage(
						{
							message: 'Error deleting thumbnail',
							buttons: [
								{
									label: 'Retry',
									action: () => {
										this.deleteThumbnail(id);
									}
								}
							]
						}
					), true);
				}
			);
	}

	public _onFileSelected(selectedFiles: FileList) {
		if (selectedFiles && selectedFiles.length) {
			const fileData: File = selectedFiles[0];

			const thumbs = Array.from(this._thumbnails.getValue().items);
			super._showLoader();
			this._kalturaServerClient.request(new ThumbAssetAddFromImageAction({
				entryId: this.data.id,
				fileData: fileData
			}))
                .cancelOnDestroy(this, this.widgetReset$)
                .monitor('add thumb')
                .subscribe(
					() => {
						this.reloadThumbnails();
					},
					error => {
						this._showBlockerMessage(new AreaBlockerMessage(
							{
								message: 'Error uploading thumbnail',
								buttons: [
									{
										label: 'Dismiss',
										action: () => {
											super._removeBlockerMessage();
										}
									}
								]
							}
						), true);
					}
				);
		}
	}


    ngOnDestroy()
    {

    }

}
