import { NgModule, ModuleWithProviders }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule } from '@angular/forms';

import { KalturaUIModule } from '@kaltura-ng2/kaltura-ui';
import { KalturaPrimeNgUIModule } from '@kaltura-ng2/kaltura-primeng-ui';

import { TreeModule, SharedModule, AutoCompleteModule, ToggleButtonModule, CalendarModule } from 'primeng/primeng';

import { CategoriesFilterComponent } from './categories-filter/categories-filter.component';
import { ContentCategoriesStore } from './providers/content-categories-store.service';
import { ContentMetadataProfilesStore } from './providers/content-metadata-profiles-store.service';
import { ContentAdditionalFiltersStore } from './providers/content-additional-filters-store.service';

import { EntryTypePipe, EntryStatusPipe, PlaylistTypePipe } from './pipes/index';

@NgModule({
    imports:      [ CommonModule, TreeModule, FormsModule, SharedModule, KalturaUIModule, KalturaPrimeNgUIModule, AutoCompleteModule, ToggleButtonModule, CalendarModule ],
    declarations: [ CategoriesFilterComponent, EntryTypePipe, EntryStatusPipe, PlaylistTypePipe ],
    providers:    [],
    exports: [ CategoriesFilterComponent, EntryTypePipe, EntryStatusPipe, PlaylistTypePipe ]
})
export class KMCContentUIModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: KMCContentUIModule,
            providers: [
                ContentCategoriesStore,
                ContentMetadataProfilesStore,
                ContentAdditionalFiltersStore
            ]
        };
    }
}
