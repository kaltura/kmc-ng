import { NgModule, ModuleWithProviders }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule } from '@angular/forms';

import { KalturaUIModule } from '@kaltura-ng2/kaltura-ui';
import { PopupWidgetModule } from '@kaltura-ng2/kaltura-ui/popup-widget';
import { KalturaPrimeNgUIModule } from '@kaltura-ng2/kaltura-primeng-ui';
import { TreeSelectionModule } from '@kaltura-ng2/kaltura-primeng-ui/tree-selection';
import { KalturaCommonModule } from '@kaltura-ng2/kaltura-common';
import { AutoCompleteModule } from '@kaltura-ng2/kaltura-primeng-ui/auto-complete';

import { TreeModule, SharedModule,  RadioButtonModule, TooltipModule, CalendarModule } from 'primeng/primeng';

import { CategoriesFilterComponent } from './categories-filter/categories-filter.component';
import { CategoriesFilterPrefsComponent } from './categories-filter-preferences/categories-filter-preferences.component';
import { CategoriesStore } from './categories-store.service';
import { KMCShellModule } from 'kmc-shell';

import { EntryTypePipe, EntryStatusPipe, PlaylistTypePipe, ModerationPipe, MaxEntriesPipe, EntryDurationPipe, FileSizePipe } from './pipes/index';
import {
    EntriesAdditionalFiltersComponent
} from "./entries-additional-filters/entries-additional-filters.component";
import { EntriesAdditionalFiltersStore } from "./entries-additional-filters/entries-additional-filters-store.service";
import { MetadataProfileStore } from '@kaltura-ng2/kaltura-common';


@NgModule({
    imports:      [
        AutoCompleteModule,
        CalendarModule,
        CommonModule,
        FormsModule,
        KalturaCommonModule,
        KalturaPrimeNgUIModule,
        KMCShellModule,
        PopupWidgetModule,
        RadioButtonModule,
        SharedModule, KalturaUIModule,
        TooltipModule,
        TreeModule,
        TreeSelectionModule
    ],
    declarations: [
        CategoriesFilterComponent,
        CategoriesFilterPrefsComponent,
        EntriesAdditionalFiltersComponent,
        EntryStatusPipe,
        EntryTypePipe,
        PlaylistTypePipe,
	    MaxEntriesPipe,
	    EntryDurationPipe,
	    ModerationPipe,
	    FileSizePipe
    ],
    providers:    [
        MetadataProfileStore,
        EntriesAdditionalFiltersStore
    ],
    exports: [
        CategoriesFilterComponent,
        CategoriesFilterPrefsComponent,
        EntriesAdditionalFiltersComponent,
        EntryStatusPipe,
        EntryTypePipe,
        PlaylistTypePipe,
	    ModerationPipe,
	    MaxEntriesPipe,
	    EntryDurationPipe,
	    FileSizePipe
    ]
})
export class KMCContentUIModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: KMCContentUIModule,
            providers: [
                CategoriesStore
            ]
        };
    }
}
