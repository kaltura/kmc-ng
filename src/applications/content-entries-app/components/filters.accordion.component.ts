import { EventEmitter, Output, Input, Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { ContentMetadataProfilesStore, MetadataProfile, MetadataProfileFilterGroup } from 'kmc-content-ui/providers/content-metadata-profiles-store.service';


@Component({
    selector: 'kmc-filters-accordion',
    templateUrl: './filters.accordion.component.html',
    styleUrls: ['./filters.accordion.component.scss'],
})
export class FiltersAccordionComponent implements OnInit, OnDestroy {

    metadataProfiles: MetadataProfile[];
    metadataProfilesSubscribe : Subscription;
    metadataProfileFilters: MetadataProfileFilterGroup[] = [];

    loading = false;

    @Output()
    metadataProfileFilterChanged = new EventEmitter<any>();
    @Output()
    categoriesChanged = new EventEmitter<any>();

    constructor(public contentMetadataProfilesStore: ContentMetadataProfilesStore) {

    }


    ngOnInit(){
      this.metadataProfilesSubscribe = this.contentMetadataProfilesStore.metadata_profiles$.subscribe(
        (metadataProfiles: any) => {
          this.metadataProfiles = metadataProfiles.items ? metadataProfiles.items : [];
          this.metadataProfileFilters = metadataProfiles.filters ? metadataProfiles.filters : [];
        },
        (error) => {
          // TODO [KMC] - handle error
        });

      this.loading = true;
      this.contentMetadataProfilesStore.reloadMetadataProfiles().subscribe(
        () => {
          this.loading = false;
        },
        (error) => {
          // TODO [KMC] - handle error
          this.loading = false;
        });
    }

    ngOnDestroy(){
      this.metadataProfilesSubscribe.unsubscribe();
    }

    metadataFilterChange(event, fieldName, value){
      const filterSelected = event.target.checked;
      const filterField = "/*[local-name()='metadata']/*[local-name()='" + fieldName + "']";
      const filterValue = value;
      this.metadataProfileFilterChanged.emit({field: filterField, selected: filterSelected, value: filterValue});
    }

    onCategoriesChanged(values : any)
    {
      this.categoriesChanged.emit(values);
    }
}

