import { NgModule, ModuleWithProviders }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule } from '@angular/forms';

import { KalturaUIModule } from '@kaltura-ng2/kaltura-ui';
import { PopupWidgetModule } from '@kaltura-ng2/kaltura-ui/popup-widget';
import { KalturaPrimeNgUIModule } from '@kaltura-ng2/kaltura-primeng-ui';

import { TreeModule, SharedModule, AutoCompleteModule, RadioButtonModule, TooltipModule } from 'primeng/primeng';

import { CategoriesFilterComponent } from './categories-filter/categories-filter.component';
import { CategoriesFilterPrefsComponent } from './categories-filter-preferences/categories-filter-preferences.component';
import { ContentCategoriesStore } from './providers/content-categories-store.service';
import { ContentMetadataProfilesStore } from './providers/content-metadata-profiles-store.service';
import { KMCShellModule } from 'kmc-shell';
import { ContentAdditionalFiltersStore } from './providers/content-additional-filters-store.service';

import { EntryTypePipe, EntryStatusPipe, PlaylistTypePipe } from './pipes/index';

@NgModule({
    imports:      [ PopupWidgetModule, CommonModule, TreeModule, FormsModule, SharedModule, KalturaUIModule, KalturaPrimeNgUIModule, AutoCompleteModule, RadioButtonModule, TooltipModule, KMCShellModule ],
    declarations: [ CategoriesFilterComponent, EntryTypePipe, EntryStatusPipe, PlaylistTypePipe,CategoriesFilterPrefsComponent ],
    providers:    [],
    exports: [ CategoriesFilterComponent, CategoriesFilterPrefsComponent, EntryTypePipe, EntryStatusPipe, PlaylistTypePipe ]
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
