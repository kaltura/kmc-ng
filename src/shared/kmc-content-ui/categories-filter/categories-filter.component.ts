import { Component, OnInit, OnDestroy, EventEmitter, Output} from '@angular/core';

import { Subscription} from 'rxjs';
import * as R from 'ramda';

import { ContentMetadataProfilesStore, MetadataProfile } from 'kmc-content-ui/providers/content-metadata-profiles-store.service';

@Component({
  selector: 'kmc-categories-filter',
  templateUrl: './categories-filter.component.html',
  styleUrls: ['./categories-filter.component.scss']
})
export class CategoriesFilterComponent implements OnInit, OnDestroy{

  loading = false;
  metadataProfiles: MetadataProfile[];
  metadataProfilesSubscribe : Subscription;

  @Output()
  categoriesChanged = new EventEmitter<any>();

  constructor(public contentMetadataProfilesStore: ContentMetadataProfilesStore) {

  }

  ngOnInit() {
    this.metadataProfilesSubscribe = this.contentMetadataProfilesStore.metadata_profiles$.subscribe(
      (metadataProfiles: any) => {
        this.metadataProfiles = metadataProfiles.items ? metadataProfiles.items : [];
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

  categorySelected(toggleProfile: MetadataProfile){
    debugger;
  }

}

