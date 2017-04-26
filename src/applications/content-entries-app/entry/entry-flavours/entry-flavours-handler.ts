import { Injectable, OnDestroy } from '@angular/core';
import { EntrySection } from '../../entry-store/entry-section-handler';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';

import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { KalturaFlavorAssetWithParams, FlavorAssetGetFlavorAssetsWithParamsAction, KalturaFlavorAssetStatus, KalturaLiveParams, KalturaEntryStatus } from '@kaltura-ng2/kaltura-api/types';
import { EntrySectionsManager } from '../../entry-store/entry-sections-manager';

@Injectable()
export class EntryFlavoursHandler extends EntrySection
{
	private _flavors : BehaviorSubject<{ items : KalturaFlavorAssetWithParams[], loading : boolean, error? : any}> = new BehaviorSubject<{ items : KalturaFlavorAssetWithParams[], loading : boolean, error? : any}>(
		{ items : [], loading : false}
	);
	public _flavors$ = this._flavors.asObservable().monitor('flavors');

	public _entryStatus = "";
	public _entryStatusClassName = "";

    constructor(manager : EntrySectionsManager, private _kalturaServerClient: KalturaServerClient, private _appLocalization: AppLocalization)
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
    }

    protected _activate(firstLoad : boolean) {
	    this._setEntryStatus();
        this._fetchFlavors();
    }

    public _fetchFlavors():void{
	    this._flavors.next({items : [], loading : true});

	    this._kalturaServerClient.request(new FlavorAssetGetFlavorAssetsWithParamsAction({
		        entryId: this.data.id
	        }))
		    .cancelOnDestroy(this,this.sectionReset$)
		    .monitor('get flavors')
		    .subscribe(
			    response =>
			    {
				    if (response && response.length) {
					    let flavors: KalturaFlavorAssetWithParams[] = [];
					    let flavorsWithAssets: KalturaFlavorAssetWithParams[] = [];
					    let flavorsWithoutAssets: KalturaFlavorAssetWithParams[] = [];
					    response.forEach((flavor: KalturaFlavorAssetWithParams) => {
							if (flavor.flavorAsset && flavor.flavorAsset.isOriginal){
								flavors.push(flavor); // this is the source. put it first in the array
							}else if (flavor.flavorAsset && (!flavor.flavorAsset.status || (flavor.flavorAsset.status && flavor.flavorAsset.status.toString() !== KalturaFlavorAssetStatus.temp.toString()))){
								flavorsWithAssets.push(flavor); // flavors with assets that is not in temp status
							}else if (!flavor.flavorAsset && flavor.flavorParams && !(flavor.flavorParams instanceof KalturaLiveParams)){
								flavorsWithoutAssets.push(flavor); // flavors without assets
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
}
