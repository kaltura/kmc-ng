import { Injectable } from '@angular/core';
import { EntrySectionHandler, OnSectionLoadedArgs } from '../../entry-store/entry-section-handler';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { SelectItem } from 'primeng/primeng';

import { EntryStore } from '../../entry-store/entry-store.service';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import { KalturaServerClient, KalturaUtils } from '@kaltura-ng2/kaltura-api';
import { KalturaAccessControl, KalturaSiteRestriction, KalturaSiteRestrictionType, KalturaCountryRestriction, KalturaCountryRestrictionType, KalturaIpAddressRestriction,
	KalturaIpAddressRestrictionType, KalturaLimitFlavorsRestriction, KalturaLimitFlavorsRestrictionType, KalturaSessionRestriction, KalturaPreviewRestriction, KalturaFlavorParams } from '@kaltura-ng2/kaltura-api/types'
import { AccessControlProfileStore, FlavoursStore, AppLocalization } from '@kaltura-ng2/kaltura-common';

import 'rxjs/add/observable/forkJoin';
import * as R from 'ramda';

@Injectable()
export class EntryAccessControlHandler extends EntrySectionHandler
{

	private _accessControlProfiles : BehaviorSubject<{ items : SelectItem[], loading : boolean, error? : any}> = new BehaviorSubject<{ items : SelectItem[], loading : boolean, error? : any}>(
		{ items : null, loading : false}
	);

	public _accessControlProfiles$ = this._accessControlProfiles.asObservable().monitor('access control profiles');
	public _selectedProfile: KalturaAccessControl = null;

	public _domainsRestriction: string = "";
	public _countriesRestriction: string = "";
	public _ipRestriction: string = "";
	public _flavourRestriction: string = "";
	public _advancedRestriction: string = "";

	private _flavourParams: KalturaFlavorParams[] = [];

	private _eventSubscription : ISubscription;

    constructor(store : EntryStore, kalturaServerClient: KalturaServerClient, private _accessControlProfileStore: AccessControlProfileStore,
                private _appLocalization: AppLocalization, private _flavoursStore: FlavoursStore)
    {
        super(store,kalturaServerClient);

        this._eventSubscription = store.events$.subscribe(
            event =>
            {

            }
        );
    }

    public get sectionType() : EntrySectionTypes
    {
        return EntrySectionTypes.AccessControl;
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    protected _onSectionReset()
    {
        this._eventSubscription.unsubscribe();
    }

    protected _onSectionLoaded(data : OnSectionLoadedArgs) {
	    if (data.firstLoad)
	    {
		    this._fetchAccessControlProfiles();
	    }
    }

	private _fetchAccessControlProfiles() : void{
		this._accessControlProfiles.next({items : [], loading : true});

		const getAPProfiles$ = this._accessControlProfileStore.get().cancelOnDestroy(this).monitor('load access control profiles');
		const getFlavours$ = this._flavoursStore.get().cancelOnDestroy(this).monitor('load flavours');

		Observable.forkJoin(getAPProfiles$,getFlavours$)
			.cancelOnDestroy(this)
			.subscribe(
				response =>
				{
					let ACProfiles = response[0].items;
					if (ACProfiles.length){
						// check if any of the access control profiles is defined as default
						const defaultIndex = R.findIndex(R.propEq('isDefault', true))(ACProfiles);
						if (defaultIndex > -1){
							// put the default profile at the beginning of the profiles array
							const defaultProfile: KalturaAccessControl[] = ACProfiles.splice(defaultIndex, 1);
							ACProfiles.splice(0, 0, defaultProfile[0]);
						}
						let profilesDataProvider: SelectItem[] = [];
						ACProfiles.forEach((profile: KalturaAccessControl) => {
							profilesDataProvider.push({"label": profile.name, "value": profile});
						});
						// search for the current entry access profile and select it in the drop down if found
						const entryACProfileIndex = R.findIndex(R.propEq('id', this.entry.accessControlId))(ACProfiles);
						entryACProfileIndex = entryACProfileIndex === -1 ? 0 : entryACProfileIndex;
						this._selectedProfile = profilesDataProvider[entryACProfileIndex].value;
						this._flavourParams = response[1].items;
						this.setRestrictions();
						this._accessControlProfiles.next({items : profilesDataProvider, loading : false});
					}

				},
				error =>
				{
					this._accessControlProfiles.next({items : [], loading : false, error : error});
				}
			);
	}

	private setRestrictions(){

		this._domainsRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.anyDomain');
		this._countriesRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.anyCountry');
		this._ipRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.anyIP');
		this. _flavourRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.anyFlavour');
		this._advancedRestriction = "";

		const restrictions = this._selectedProfile.restrictions;
		if (restrictions.length){
			restrictions.forEach(restriction => {
				// domains restrictions
				if (restriction instanceof KalturaSiteRestriction){
					if (restriction.siteRestrictionType === KalturaSiteRestrictionType.AllowSiteList) {
						this._domainsRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.allowDomains').replace("%1", restriction.siteList);
					}
					if (restriction.siteRestrictionType === KalturaSiteRestrictionType.RestrictSiteList) {
						this._domainsRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.blockDomains').replace("%1", restriction.siteList);
					}
				}
				// countries restrictions
				if (restriction instanceof KalturaCountryRestriction){
					if (restriction.countryRestrictionType === KalturaCountryRestrictionType.AllowCountryList) {
						this._countriesRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.allowCountries').replace("%1", this.getCountriesByCode(restriction.countryList));
					}
					if (restriction.countryRestrictionType === KalturaCountryRestrictionType.RestrictCountryList) {
						this._countriesRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.blockCountries').replace("%1", this.getCountriesByCode(restriction.countryList));
					}
				}
				// IP restrictions
				if (restriction instanceof KalturaIpAddressRestriction){
					if (restriction.ipAddressRestrictionType === KalturaIpAddressRestrictionType.AllowList) {
						this._ipRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.allowIPs').replace("%1", restriction.ipAddressList);
					}
					if (restriction.ipAddressRestrictionType === KalturaIpAddressRestrictionType.RestrictList) {
						this._ipRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.blockIPs').replace("%1", restriction.ipAddressList);
					}
				}
				// Flavour restrictions
				if (restriction instanceof KalturaLimitFlavorsRestriction && this._flavourParams.length){
					// convert flavour IDs to flavour names
					let flavourIDs = restriction.flavorParamsIds.split(",");
					let flavourNames = [];
					flavourIDs.forEach(flavourId => {
						let flavour: KalturaFlavorParams = R.find(R.propEq('id', parseInt(flavourId)))(this._flavourParams);
						if (flavour !== undefined){
							flavourNames.push(flavour.name);
						}
					});

					if (restriction.limitFlavorsRestrictionType === KalturaLimitFlavorsRestrictionType.AllowList) {
						this._flavourRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.allowFlavours').replace("%1", flavourNames.join(", "));
					}
					if (restriction.limitFlavorsRestrictionType === KalturaLimitFlavorsRestrictionType.RestrictList) {
						this._flavourRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.blockFlavours').replace("%1", flavourNames.join(", "));
					}
				}
				// Advanced restrictions
				if (restriction instanceof KalturaSessionRestriction){
					this._advancedRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.ks');
				}
				if (restriction instanceof KalturaPreviewRestriction){
					this._advancedRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.freePreview').replace("%1", KalturaUtils.formatTime(restriction.previewLength, true));
				}
			});
		}
	}

	private getCountriesByCode(codesList: string): string{
		let countries = [];
		const codes = codesList.split(",");
		codes.forEach(code => {
			const country = this._appLocalization.get('countries.' + code.toLowerCase());
			if (country){
				countries.push(country);
			}
		});
		return countries.join(", ");
	}

	public _onProfileChange(event){
		this.setRestrictions();
	}
}
