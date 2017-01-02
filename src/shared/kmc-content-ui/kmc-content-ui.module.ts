import { NgModule, ModuleWithProviders }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule } from '@angular/forms';

import { KalturaUIModule } from '@kaltura-ng2/kaltura-ui';
import { KalturaPrimeNgUIModule } from '@kaltura-ng2/kaltura-primeng-ui';

import { TreeModule, SharedModule, AutoCompleteModule, RadioButtonModule, TooltipModule } from 'primeng/primeng';

import { CategoriesFilterComponent } from './categories-filter/categories-filter.component';
import { CategoriesFilterPrefsComponent } from './categories-filter-preferences/categories-filter-preferences.component';
import { ContentCategoriesStore } from './providers/content-categories-store.service';
import { ContentMetadataProfilesStore } from './providers/content-metadata-profiles-store.service';
import { KMCShellModule } from 'kmc-shell';

import { EntryTypePipe, EntryStatusPipe, PlaylistTypePipe } from './pipes/index';

@NgModule({
    imports:      [ CommonModule, TreeModule, FormsModule, SharedModule, KalturaUIModule, KalturaPrimeNgUIModule, AutoCompleteModule, RadioButtonModule, TooltipModule, KMCShellModule ],
    declarations: [ CategoriesFilterComponent, CategoriesFilterPrefsComponent, EntryTypePipe, EntryStatusPipe, PlaylistTypePipe ],
    providers:    [],
    exports: [ CategoriesFilterComponent, CategoriesFilterPrefsComponent, EntryTypePipe, EntryStatusPipe, PlaylistTypePipe ]
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
