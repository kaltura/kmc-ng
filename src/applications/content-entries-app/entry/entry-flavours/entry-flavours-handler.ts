import { Injectable } from '@angular/core';
import { EntrySection } from '../../entry-store/entry-section-handler';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';

import { AppLocalization, AppConfig, AppAuthentication } from '@kaltura-ng2/kaltura-common';
import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { BrowserService } from 'kmc-shell';
import { KalturaFlavorAssetWithParams, FlavorAssetGetFlavorAssetsWithParamsAction, KalturaFlavorAssetStatus, KalturaLiveParams, KalturaEntryStatus, KalturaWidevineFlavorAsset,
	FlavorAssetDeleteAction, FlavorAssetConvertAction, FlavorAssetReconvertAction } from '@kaltura-ng2/kaltura-api/types';
import { EntrySectionsManager } from '../../entry-store/entry-sections-manager';
import { Message, ConfirmationService } from 'primeng/primeng';

export interface Flavor{
	name: string,
	id: string,
	paramsId: number,
	isSource: boolean,
	isWeb: boolean,
	isWidevine: boolean,
	format: string,
	codec: string,
	bitrate: string,
	size: string,
	dimensions: string,
	status: string,
	statusLabel: string,
	statusTooltip: string,
	errorStatus: boolean,
	tags: string,
	drm: any
}

@Injectable()
export class EntryFlavoursHandler extends EntrySection
{
	private _flavors : BehaviorSubject<{ items : Flavor[], loading : boolean, error? : any}> = new BehaviorSubject<{ items : Flavor[], loading : boolean, error? : any}>(
		{ items : [], loading : false}
	);
	public _flavors$ = this._flavors.asObservable().monitor('flavors');

	public _entryStatus = "";
	public _entryStatusClassName = "";
	public sourceAvailabale: boolean = false;
	public _msgs: Message[] = [];

    constructor(manager : EntrySectionsManager, private _kalturaServerClient: KalturaServerClient, private _appLocalization: AppLocalization, private _confirmationService: ConfirmationService,
	    private _appConfig: AppConfig, private _appAuthentication: AppAuthentication, private _browserService: BrowserService)
    {
        super(manager);
    }

    public get sectionType() : EntrySectionTypes
    {
        return EntrySectionTypes.Flavours;
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    protected _reset()
    {
	    this._msgs = [];
    }

    protected _activate(firstLoad : boolean) {
	    this._setEntryStatus();
        this._fetchFlavors();
    }

    public _fetchFlavors():void{
	    this._flavors.next({items : [], loading : true});
	    this.sourceAvailabale = false;

	    this._kalturaServerClient.request(new FlavorAssetGetFlavorAssetsWithParamsAction({
		        entryId: this.data.id
	        }))
		    .cancelOnDestroy(this,this.sectionReset$)
		    .monitor('get flavors')
		    .subscribe(
			    response =>
			    {
				    if (response && response.length) {
					    let flavors: Flavor[] = [];
					    let flavorsWithAssets: Flavor[] = [];
					    let flavorsWithoutAssets: Flavor[] = [];
					    response.forEach((flavor: KalturaFlavorAssetWithParams) => {
							if (flavor.flavorAsset && flavor.flavorAsset.isOriginal){
								flavors.push(this.createFlavor(flavor, response)); // this is the source. put it first in the array
								this.sourceAvailabale = true;
							}else if (flavor.flavorAsset && (!flavor.flavorAsset.status || (flavor.flavorAsset.status && flavor.flavorAsset.status.toString() !== KalturaFlavorAssetStatus.temp.toString()))){
								flavorsWithAssets.push(this.createFlavor(flavor, response)); // flavors with assets that is not in temp status
							}else if (!flavor.flavorAsset && flavor.flavorParams && !(flavor.flavorParams instanceof KalturaLiveParams)){
								flavorsWithoutAssets.push(this.createFlavor(flavor, response)); // flavors without assets
							}
					    });
					    flavors = flavors.concat(flavorsWithAssets).concat(flavorsWithoutAssets); // source first, then flavors with assets, then flavors without assets
					    this._flavors.next({items : flavors, loading : false, error : false});
				    }
			    },
			    error =>
			    {
				    this._flavors.next({items : [], loading : false, error : error});
			    }
		    );
    }

	private createFlavor(flavor: KalturaFlavorAssetWithParams, allFlavors: KalturaFlavorAssetWithParams[]): Flavor{
		let newFlavor: Flavor = {
			name: flavor.flavorParams ? flavor.flavorParams.name : '',
			id: flavor.flavorAsset ? flavor.flavorAsset.id : '',
			paramsId: flavor.flavorParams.id,
			isSource: flavor.flavorAsset ? flavor.flavorAsset.isOriginal : false,
			isWidevine: flavor.flavorAsset ? flavor.flavorAsset instanceof KalturaWidevineFlavorAsset : false,
			isWeb: flavor.flavorAsset ? flavor.flavorAsset.isWeb : false,
			format: flavor.flavorAsset ? flavor.flavorAsset.fileExt : '',
			codec: flavor.flavorAsset ? flavor.flavorAsset.videoCodecId : '',
			bitrate: (flavor.flavorAsset && flavor.flavorAsset.bitrate && flavor.flavorAsset.bitrate > 0) ? flavor.flavorAsset.bitrate.toString() : '',
			size: flavor.flavorAsset ? flavor.flavorAsset.size.toString() : '',
			dimensions: "",
			status: flavor.flavorAsset ? flavor.flavorAsset.status.toString() : '',
			statusLabel: "",
			statusTooltip: "",
			errorStatus: false,
			tags: flavor.flavorAsset ? flavor.flavorAsset.tags : '-',
			drm: {}
		}
		// set dimensions
		const width: number = flavor.flavorAsset ? flavor.flavorAsset.width :flavor.flavorParams.width;
		const height: number = flavor.flavorAsset ? flavor.flavorAsset.height :flavor.flavorParams.height;
		const w: string = width === 0 ? "[auto]" : width.toString();
		const h: string = height === 0 ? "[auto]" : height.toString();
		newFlavor.dimensions = w + " x " + h;
		// set status
		if (flavor.flavorAsset) {
			switch (flavor.flavorAsset.status.toString()){
				case KalturaFlavorAssetStatus.converting.toString():
					newFlavor.statusLabel = this._appLocalization.get('applications.content.entryDetails.flavours.status.converting');
					break;
				case KalturaFlavorAssetStatus.error.toString():
					newFlavor.statusLabel = this._appLocalization.get('applications.content.entryDetails.flavours.status.error');
					newFlavor.errorStatus = true;
					break;
				case KalturaFlavorAssetStatus.deleted.toString():
					newFlavor.statusLabel = this._appLocalization.get('applications.content.entryDetails.flavours.status.deleted');
					break;
				case KalturaFlavorAssetStatus.queued.toString():
					newFlavor.statusLabel = this._appLocalization.get('applications.content.entryDetails.flavours.status.queue');
					break;
				case KalturaFlavorAssetStatus.ready.toString():
					newFlavor.statusLabel = this._appLocalization.get('applications.content.entryDetails.flavours.status.ready');
					break;
				case KalturaFlavorAssetStatus.notApplicable.toString():
					newFlavor.statusLabel = this._appLocalization.get('applications.content.entryDetails.flavours.status.na');
					newFlavor.statusTooltip = this._appLocalization.get('applications.content.entryDetails.flavours.status.naTooltip');
					break;
				case KalturaFlavorAssetStatus.waitForConvert.toString():
					newFlavor.statusLabel = this._appLocalization.get('applications.content.entryDetails.flavours.status.waiting');
					break;
				case KalturaFlavorAssetStatus.importing.toString():
					newFlavor.statusLabel = this._appLocalization.get('applications.content.entryDetails.flavours.status.uploading');
					break;
				case KalturaFlavorAssetStatus.validating.toString():
					newFlavor.statusLabel = this._appLocalization.get('applications.content.entryDetails.flavours.status.validating');
					break;
				case KalturaFlavorAssetStatus.exporting.toString():
					newFlavor.statusLabel = this._appLocalization.get('applications.content.entryDetails.flavours.status.exporting');
					break;
			}
		}
		// add DRM details
		if (newFlavor.isWidevine){
			// get source flavors for DRM
			const sourceIDs = (flavor.flavorAsset as KalturaWidevineFlavorAsset).actualSourceAssetParamsIds ? (flavor.flavorAsset as KalturaWidevineFlavorAsset).actualSourceAssetParamsIds.split(",") : [];
			let sources = [];
			sourceIDs.forEach(sourceId => {
				allFlavors.forEach(flavor => {
					if (flavor.flavorParams.id.toString() === sourceId){
						sources.push(flavor.flavorParams.name);
					}
				});
			});
			// set start and end date
			let startDate = (flavor.flavorAsset as KalturaWidevineFlavorAsset).widevineDistributionStartDate;
			if (startDate == -2147483648 || startDate == 18001 || startDate == 2000001600) {
				startDate = null;
			}
			let endDate = (flavor.flavorAsset as KalturaWidevineFlavorAsset).widevineDistributionEndDate;
			if (endDate == -2147483648 || endDate == 18001 || endDate == 2000001600) {
				endDate = null;
			}
			newFlavor.drm = {
				name: flavor.flavorParams.name,
				id: (flavor.flavorAsset as KalturaWidevineFlavorAsset).widevineAssetId,
				flavorSources: sources,
				startTime: startDate,
				endTime: endDate
			};
		}
		return newFlavor;
	}

    private _setEntryStatus(){
	    const status = this.data.status.toString();
	    switch (status){
		    case KalturaEntryStatus.noContent.toString():
		    	this._entryStatusClassName = "kStatusNoContent kIconwarning";
			    break;
		    case KalturaEntryStatus.ready.toString():
		    	this._entryStatusClassName = "kStatusReady kIconconfirmation";
			    break;
		    case KalturaEntryStatus.errorConverting.toString():
		    case KalturaEntryStatus.errorImporting.toString():
		    	this._entryStatusClassName = "kStatusError kIconwarning";
			    break;
		    default:
		    	this._entryStatusClassName = "kStatusErrorProcessing kIconwarning";
			    break;
	    }
	    this._entryStatus = this._appLocalization.get('applications.content.entryDetails.flavours.' + this._entryStatusClassName.split(" ")[0]);
    }

    public deleteFlavor(flavor: Flavor): void{
	    this._confirmationService.confirm({
		    message: this._appLocalization.get('applications.content.entryDetails.flavours.deleteConfirm',{"0": flavor.id}),
		    accept: () => {
			    this._kalturaServerClient.request(new FlavorAssetDeleteAction({
					    id: flavor.id
				    }))
				    .cancelOnDestroy(this,this.sectionReset$)
				    .monitor('delete flavor: '+flavor.id)
				    .subscribe(
					    response =>
					    {
						    this._msgs.push({severity: 'success', summary: '', detail: this._appLocalization.get('applications.content.entryDetails.flavours.deleteSuccess')});
						    let flavors: Flavor[] = Array.from(this._flavors.getValue().items).filter( (fl: Flavor) => {
							    return fl.id !== flavor.id;
						    });
						    this._flavors.next({items : flavors, loading : false, error : false});
					    },
					    error =>
					    {
						    this._msgs.push({severity: 'error', summary: '', detail: this._appLocalization.get('applications.content.entryDetails.flavours.deleteFailure')});
					    }
				    );
		    }
	    });
    }

    public downloadFlavor (flavor: Flavor): void{
	    const baseUrl = this._appConfig.get('core.kaltura.cdnUrl');
	    const protocol = baseUrl.split(":")[0];
	    const partnerId = this._appAuthentication.appUser.partnerId;
	    let url = baseUrl + '/p/' + partnerId +'/sp/' + partnerId + '00/playManifest/entryId/' + this.data.id + '/flavorId/' + flavor.id + '/format/download/protocol/' + protocol;
	    this._browserService.openLink(url);
    }

    public convertFlavor(flavor: Flavor): void{
	    this._convert(flavor, flavor.paramsId, new FlavorAssetConvertAction({
		    flavorParamsId: flavor.paramsId,
		    entryId: this.data.id
	    }));
    }

	public reconvertFlavor(flavor: Flavor): void {
		this._convert(flavor, flavor.id, new FlavorAssetReconvertAction({
			id: flavor.id
		}));
	}

	private _convert(flavor: Flavor, id: number, request: any): void{
		flavor.status = KalturaFlavorAssetStatus.waitForConvert.toString();
		this._kalturaServerClient.request(request)
			.cancelOnDestroy(this,this.sectionReset$)
			.monitor('convert flavor')
			.subscribe(
				response =>
				{
					let flavors: Flavor[] = Array.from(this._flavors.getValue().items);
					flavors.forEach((fl:Flavor) => {
						if (fl.id === id){
							fl.status = KalturaFlavorAssetStatus.converting.toString();
						}
					});
					this._flavors.next({items : flavors, loading : false, error : false});
				},
				error =>
				{
					this._msgs.push({severity: 'error', summary: '', detail: this._appLocalization.get('applications.content.entryDetails.flavours.convertFailure')});
					this._fetchFlavors(); // reload flavors as we need to get the flavor status from the server
				}
			);
	}
}
