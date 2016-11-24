import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { KalturaAPIClient } from '@kaltura-ng2/kaltura-api';
import { MetadataProfileService, KalturaMetadataProfileFilter, KalturaDetachedResponseProfile } from '@kaltura-ng2/kaltura-api/metadata-profile';

import * as R from 'ramda';

export interface MetadataProfiles{
    items : MetadataProfile[],
    filters: any[],
    loaded : boolean,
    status: string
}

export class MetadataProfile {
  id: string;
  name: string;
  xsd: any;
  views?: any;
}
export class MetadataProfileFilterGroup {
  label?: string;
  filters?: MetadataProfileFilter[];
}
export class MetadataProfileFilter {
  filterName?: string;
  fieldName?: string;
  values?: any[];
}

@Injectable()
export class ContentMetadataProfilesStore
{
    // TODO [KMC] - clear cached data on logout

    private _metadata_profiles: BehaviorSubject<MetadataProfiles> = new BehaviorSubject({items: [], filters: [], loaded: false, status: ''});
    public metadata_profiles$: Observable<MetadataProfiles> = this._metadata_profiles.asObservable();

    constructor(private kalturaAPIClient : KalturaAPIClient) {

    }


    public reloadMetadataProfiles(ignoreCache: boolean = false) : Observable<boolean>
    {
        let filter, responseProfile;

        filter = new KalturaMetadataProfileFilter();
        Object.assign(filter, {orderBy : '+name', createModeNotEqual: 3, metadataObjectTypeEqual: '1'});

        responseProfile = new KalturaDetachedResponseProfile();
        Object.assign(responseProfile, {
          "objectType": "KalturaDetachedResponseProfile",
          "type": "1",
          "fields": "id,name,xsd,views"
        });

        const metadata_profiles = this._metadata_profiles.getValue();

      if (ignoreCache || !metadata_profiles.loaded || metadata_profiles.status) {
        this._metadata_profiles.next({items: [], filters: [], loaded: false, status: ''});

        return Observable.create(observe => {
          MetadataProfileService.list(filter, responseProfile)
            .execute(this.kalturaAPIClient)
            .map((response: any) => {
              if (response && response.objects){
                return response.objects;
              }else{
                return [];
              }
            })
            .subscribe(
              (metadataProfiles: any[]) => {
                let metadataProfileFilters = [];
                this.createMetadataProfileFilters(metadataProfiles, metadataProfileFilters);
                this._metadata_profiles.next({items: <MetadataProfile[]>metadataProfiles, filters: metadataProfileFilters, loaded: true, status: ''});
                observe.next(true);
                observe.complete();
              },
              () => {
                // TODO [KMC]: handle error
                observe.next(false);
                observe.complete();
              }
            )
        });
      }else {
        return Observable.of(true);
      }
    }

  createMetadataProfileFilters(metadataProfiles, metadataProfileFilters){
    try {
      // for each metadata profile, parse its XSD and see if it has a searchable list in it
      metadataProfiles.forEach((metadataProfile) => {
        const xsd = metadataProfile.xsd ? metadataProfile.xsd : null; // try to get the xsd schema from the metadata profile
        if (xsd) {
          const parser = new DOMParser();
          const schema = parser.parseFromString(xsd, "text/xml");      // create an xml documents from the schema
          const elements = schema.getElementsByTagNameNS("http://www.w3.org/2001/XMLSchema", "element");    // get all element nodes

          // for each xsd element with an ID attribute - search for a simpleType node of type listType - this means we have to add it to the filters if it is searchable
          for (let i = 0; i < elements.length; i++) {
            const currentNode = elements[i];
            if (currentNode.getAttribute("id") !== null) {            // only elements with ID attribue can be used for filters
              const simpleTypes = currentNode.getElementsByTagNameNS("http://www.w3.org/2001/XMLSchema", "simpleType");
              if (simpleTypes.length > 0) {
                // check if this element is searchable
                if (currentNode.getElementsByTagName("searchable").length && currentNode.getElementsByTagName("searchable")[0].textContent === "true") {
                  // check if the simpleType type is "listType"
                  if (simpleTypes[0].getElementsByTagNameNS("http://www.w3.org/2001/XMLSchema", "restriction").length && simpleTypes[0].getElementsByTagNameNS("http://www.w3.org/2001/XMLSchema", "restriction")[0].getAttribute("base") === "listType") {
                    // get filter properties and add it to the metadata profile filters list
                    const filterLabel = currentNode.getElementsByTagNameNS("http://www.w3.org/2001/XMLSchema", "appinfo").length ? currentNode.getElementsByTagNameNS("http://www.w3.org/2001/XMLSchema" ,"appinfo")[0].getElementsByTagName("label")[0].innerHTML : "";
                    const valueNodes = simpleTypes[0].getElementsByTagNameNS("http://www.w3.org/2001/XMLSchema", "enumeration");
                    const values = [];
                    for (let j = 0; j < valueNodes.length; j++) {
                      values.push(valueNodes[j].getAttribute("value"));
                    }
                    const fieldName = currentNode.getAttribute("name");
                    this.addMetadataProfileFilter(metadataProfileFilters, metadataProfile.name, filterLabel, fieldName, values);
                  }
                }
              }
            }
          }
        }
      });
    }catch(e){
      // TODO [kmc] handle error
      console.log("An error occured during the metadata profile filters creation process.");
    }
  }

  addMetadataProfileFilter(metadataProfileFilters, metadataProfileName, filterName, fieldName, values){
    // check if current filter group (accordion header) already exists. If not - create a new one
    let filterGroup: MetadataProfileFilterGroup = R.find(R.propEq('label', metadataProfileName))(metadataProfileFilters);
    if (typeof filterGroup === "undefined"){
      filterGroup = {label: metadataProfileName, filters: []};
      metadataProfileFilters.push(filterGroup);
    }
    // if the filter does not exist in the filters group yet - add it to the group
    if (typeof R.find(R.propEq('filterName', filterName))(filterGroup.filters) === "undefined") {
      filterGroup.filters.push({filterName: filterName, fieldName: fieldName, values: values});
    }
  }

}

