import { Component, OnInit, OnDestroy, EventEmitter, Output} from '@angular/core';

import { Subscription} from 'rxjs';
import * as R from 'ramda';

import { ContentAdditionalFiltersStore, AdditionalFilter, MetadataProfileFilterGroup, MetadataProfileFilter } from 'kmc-content-ui/providers/content-additional-filters-store.service';
import { FilterType } from './additional-filters-types';

export interface RefineFiltersChangedArgs
{
    createdAtGreaterThanOrEqual? : Number;
    createdAtLessThanOrEqual? : Number;
    mediaTypeIn? : string;
    statusIn? : string;
    durationTypeMatchOr? :string;
    isRoot? : number;
    endDateLessThanOrEqual? : Number;
    startDateLessThanOrEqualOrNull? : Number;
    endDateGreaterThanOrEqualOrNull? : Number;
    startDateGreaterThanOrEqual? : Number;
    moderationStatusIn? : string;
    replacementStatusIn? : string;
    flavorParamsIdsMatchOr? : string;
    accessControlIdIn? : string;
    distributionProfiles? : string[]; // since this should fill the advanced search objecct with the metadata profiles - it will be parsed in the content-entries-store
}

function toServerDate(value? : Date) : number
{
    return value ? value.getTime() / 1000 : null;
}

@Component({
    selector: 'kAdditionalFilter',
    templateUrl: './additional-filters.component.html',
    styleUrls: ['./additional-filters.component.scss']
})
export class AdditionalFiltersComponent implements OnInit, OnDestroy{

    additionalFiltersSubscribe : Subscription;
    additionalFilters: AdditionalFilter[];
    metadataProfilesFilters: MetadataProfileFilterGroup[];
    selectedFilters: any[] = [];

    filter: RefineFiltersChangedArgs;
    loading = false;

    createdFrom: Date;
    createdTo: Date;
    scheduledFrom: Date;
    scheduledTo: Date;

    @Output()
    refineFiltersChanged = new EventEmitter<RefineFiltersChangedArgs>();


    constructor(public contentAdditionalFiltersStore: ContentAdditionalFiltersStore) {
    }

    ngOnInit() {
        this.additionalFiltersSubscribe = this.contentAdditionalFiltersStore.additionalFilters$.subscribe(
            (additionalFiltersRoot: any) => {
                this.additionalFilters = additionalFiltersRoot.items ? additionalFiltersRoot.items : [];
                this.metadataProfilesFilters = additionalFiltersRoot.metadataFilters ? additionalFiltersRoot.metadataFilters : [];
            },
            (error) => {
                // TODO [KMC] - handle error
            });

        this.initFilter();
        this.reloadAdditionalFilters();
    }

    reloadAdditionalFilters(){
        this.loading = true;
        this.contentAdditionalFiltersStore.reloadAdditionalFilters(false).subscribe(
            () => {
                this.loading = false;
            },
            (error) => {
                // TODO [KMC] - handle error
                this.loading = false;
            });
    }

    clearDates(){
        this.createdFrom = null;
        this.createdTo = null;
        this.updateFilter();
    }

    clearAll(){
        this.selectedFilters = [];
        // clear all partial selections
        this.additionalFilters.forEach((filter: AdditionalFilter) => {
            if (filter['partialSelected']){
                filter['partialSelected'] = false;
            }
        });
        this.updateFilter();
    }

    // init filter
    initFilter(){
        this.filter = {
            statusIn: "-1,-2,0,1,2,7,4",
            mediaTypeIn: "1,2,5,6,201"
        };
    }
    // update the filter
    updateFilter(){
        this.initFilter();
        let filters: AdditionalFilter[];

        // set creation dates filter
        if (this.createdFrom || this.createdTo) {
            this.filter.createdAtGreaterThanOrEqual = toServerDate(this.createdFrom);
            this.filter.createdAtLessThanOrEqual = toServerDate(this.createdTo);
        }

        this.setFlatFilter(FilterType.Types.IngestionStatus, 'statusIn');                  // set ingestion status filter
        this.setFlatFilter(FilterType.Types.MediaType, 'mediaTypeIn');                     // set media type filter
        this.setFlatFilter(FilterType.Types.Durations, 'durationTypeMatchOr');             // set duration filter
        this.setFlatFilter(FilterType.Types.ModerationStatuses, 'moderationStatusIn');     // set moderation status filter
        this.setFlatFilter(FilterType.Types.ReplacementStatuses, 'replacementStatusIn');   // set replacement status filter
        this.setFlatFilter(FilterType.Types.Flavors, 'flavorParamsIdsMatchOr');            // set flavors filter
        this.setFlatFilter(FilterType.Types.AccessControlProfiles, 'accessControlIdIn');   // set access control profiles filter

        // set original and clipped entries filter
        filters = R.filter((filter: AdditionalFilter) => filter.filterName === FilterType.Types.OriginalAndClipped, this.selectedFilters);
        if (filters.length > 1) {
            this.filter.isRoot = -1;
        }
        if (filters.length === 1) {
            this.filter.isRoot = parseInt(filters[0].id);
        }

        // set time scheduling filter
        filters = R.filter((filter: AdditionalFilter) => filter.filterName === FilterType.Types.TimeScheduling, this.selectedFilters);
        if (filters.length){
            if (R.findIndex(R.propEq('id', 'past'))(filters) > -1){
                this.filter.endDateLessThanOrEqual = toServerDate(new Date());
            }
            if (R.findIndex(R.propEq('id', 'live'))(filters) > -1){
                this.filter.startDateLessThanOrEqualOrNull = toServerDate(new Date());
                this.filter.endDateGreaterThanOrEqualOrNull = toServerDate(new Date());
            }
            if (R.findIndex(R.propEq('id', 'future'))(filters) > -1){
                this.filter.startDateGreaterThanOrEqual = toServerDate(new Date());
            }
            if (R.findIndex(R.propEq('id', 'scheduled'))(filters) > -1){
                this.filter.startDateGreaterThanOrEqual = toServerDate(this.scheduledFrom);
                this.filter.endDateLessThanOrEqual = toServerDate(this.scheduledTo);
            }
        }

        // set distribution profiles filter
        filters = R.filter((filter: AdditionalFilter) => filter.filterName === FilterType.Types.DistributionProfiles, this.selectedFilters);
        if (filters.length){
            this.filter.distributionProfiles = [];
            filters.forEach( (distributionProfile) => {
                if (distributionProfile.id.length){
                    this.filter.distributionProfiles.push(distributionProfile.id);
                }
            });
        }

        console.info(this.filter);
        this.refineFiltersChanged.emit(this.filter);
    }

    setFlatFilter(filterName: string, filterPoperty: string){
        const filters: AdditionalFilter[] = R.filter((filter: AdditionalFilter) => filter.filterName === filterName, this.selectedFilters);
        if (filters.length){
            this.filter[filterPoperty] = "";
            filters.forEach((filter: AdditionalFilter) => {
                if (filter.id !== '') {
                    this.filter[filterPoperty] += filter.id + ',';
                }
            });
            this.filter[filterPoperty] = this.filter[filterPoperty].substr(0, this.filter[filterPoperty].length-1); // remove last comma from string
        }
    }

    isScheduledEnabled(){
        const filters: AdditionalFilter[] = R.filter((filter: AdditionalFilter) => filter.filterName === FilterType.Types.TimeScheduling, this.selectedFilters);
        return R.findIndex(R.propEq('id', 'scheduled'))(filters) > -1;
    }

    blockScheduleToggle(event){
        event.stopPropagation();
    }

    ngOnDestroy(){
        this.additionalFiltersSubscribe.unsubscribe();
    }
}
