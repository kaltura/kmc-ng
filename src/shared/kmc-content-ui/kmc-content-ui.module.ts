import { NgModule, ModuleWithProviders }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule } from '@angular/forms';

import { KalturaUIModule } from '@kaltura-ng2/kaltura-ui';

import { TreeModule, SharedModule } from 'primeng/primeng';

import { CategoriesFilterComponent } from './categories-filter/categories-filter.component';
import { ContentCategoriesStore } from './providers/content-categories-store.service';
import { ContentMetadataProfilesStore } from './providers/content-metadata-profiles-store.service';
import { FillHeightDirective } from './directives/datatable-fillheight';

import { EntryTypePipe, EntryStatusPipe, PlaylistTypePipe } from './pipes/index';

@NgModule({
  imports:      [ CommonModule, TreeModule, FormsModule, SharedModule, KalturaUIModule ],
  declarations: [ CategoriesFilterComponent, EntryTypePipe, EntryStatusPipe, PlaylistTypePipe, FillHeightDirective ],
  providers:    [],
  exports: [ CategoriesFilterComponent, EntryTypePipe, EntryStatusPipe, PlaylistTypePipe, FillHeightDirective ]
})
export class KMCContentUIModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: KMCContentUIModule,
      providers: [
        ContentCategoriesStore,
        ContentMetadataProfilesStore
      ]
    };
  }
}
