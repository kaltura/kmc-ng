import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { KalturaUIModule, TooltipModule } from '@kaltura-ng2/kaltura-ui';
import { PopupWidgetModule } from '@kaltura-ng2/kaltura-ui/popup-widget';
import { TagsModule } from '@kaltura-ng2/kaltura-ui/tags';
import { KalturaPrimeNgUIModule } from '@kaltura-ng2/kaltura-primeng-ui';
import { RadioButtonModule, TreeModule, TieredMenuModule, CheckboxModule, DataTableModule, SharedModule, InputTextModule, ButtonModule, AccordionModule, CalendarModule,  MultiSelectModule, PaginatorModule, MenuModule } from 'primeng/primeng';
import { KalturaCommonModule } from '@kaltura-ng2/kaltura-common';
import { KMCShellModule } from 'kmc-shell';

import { EntriesTableComponent } from './entries-table.component';
import { EntriesListComponent } from "./entries-list.component";
import { TreeSelectionModule } from '@kaltura-ng2/kaltura-primeng-ui/tree-selection';
import { AutoCompleteModule } from '@kaltura-ng2/kaltura-primeng-ui/auto-complete';

import { CategoriesFilterComponent } from './categories-filter/categories-filter.component';
import { CategoriesFilterPrefsComponent } from './categories-filter-preferences/categories-filter-preferences.component';
import { CategoriesStore } from './categories-store.service';

import { MaxEntriesPipe } from './pipes/max-entries.pipe';
import { EntryDurationPipe } from './pipes/entry-duration.pipe';
import {
    EntriesAdditionalFiltersComponent
} from "./entries-additional-filters/entries-additional-filters.component";
import { EntriesAdditionalFiltersStore } from "./entries-additional-filters/entries-additional-filters-store.service";
import { MetadataProfileStore } from '@kaltura-ng2/kaltura-common';
import { ContentEntriesAppSharedModule } from '../shared/content-entries-app-shared.module';
import { AreaBlockerModule } from '@kaltura-ng2/kaltura-ui';

@NgModule({
    imports:      [
        AreaBlockerModule,
        ContentEntriesAppSharedModule,
        RadioButtonModule,
        TreeSelectionModule,
        AutoCompleteModule,
        AccordionModule,
        ButtonModule,
        CalendarModule,
        CheckboxModule,
        CommonModule,
        DataTableModule,
        FormsModule,
        InputTextModule,
        KalturaCommonModule,
        KalturaPrimeNgUIModule,
        KalturaUIModule,
        KMCShellModule,
        MenuModule,
        MultiSelectModule,
        PaginatorModule,
        PopupWidgetModule,
        ReactiveFormsModule,
        RouterModule.forChild([]),
        SharedModule,
        TagsModule,
        TieredMenuModule,
        TreeModule,
	    TooltipModule
    ],
    declarations: [
        EntriesListComponent,
        EntriesTableComponent,
        CategoriesFilterComponent,
        CategoriesFilterPrefsComponent,
        EntriesAdditionalFiltersComponent,
        MaxEntriesPipe,
        EntryDurationPipe
    ],
    exports: [
    ],
    providers:    [
        CategoriesStore,
        MetadataProfileStore,
        EntriesAdditionalFiltersStore

    ]
})
export class EntriesModule { }
