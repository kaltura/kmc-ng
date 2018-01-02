import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PrimeTreeModule} from '@kaltura-ng/kaltura-primeng-ui/prime-tree';
import {AreaBlockerModule, KalturaUIModule, StickyModule, TooltipModule} from '@kaltura-ng/kaltura-ui';

import {
  ButtonModule,
  CalendarModule,
  CheckboxModule,
  DataTableModule, DropdownModule,
  InputTextModule,
  MenuModule,
  PaginatorModule,
  RadioButtonModule, TieredMenuModule,
  TreeModule
} from 'primeng/primeng';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {KalturaCommonModule} from '@kaltura-ng/kaltura-common';
import {AutoCompleteModule, KalturaPrimeNgUIModule} from '@kaltura-ng/kaltura-primeng-ui';
import {PopupWidgetModule} from '@kaltura-ng/kaltura-ui/popup-widget';

import { EntryStatusPipe } from 'app-shared/content-shared/pipes/entry-status.pipe';
import { CategoriesTreeComponent } from 'app-shared/content-shared/categories-tree/categories-tree.component';
import { SchedulingComponent } from 'app-shared/content-shared/scheduling/scheduling.component';
import { CategoriesSearchService } from 'app-shared/content-shared/categories-search.service';
import { EntryTypePipe } from 'app-shared/content-shared/pipes/entry-type.pipe';
import { EntryDurationPipe } from 'app-shared/content-shared/pipes/entry-duration.pipe';
import { MaxEntriesPipe } from 'app-shared/content-shared/pipes/max-entries.pipe';
import { PrimeTableSortDirectionPipe } from 'app-shared/content-shared/pipes/prime-table-sort-direction.pipe';
import { EntriesRefineFiltersComponent } from 'app-shared/content-shared/entries-refine-filters/entries-refine-filters.component';
import { CategoriesFilterPrefsComponent } from 'app-shared/content-shared/categories-filter-preferences/categories-filter-preferences.component';
import { CategoriesFilterComponent } from 'app-shared/content-shared/categories-filter/categories-filter.component';
import { EntriesRefineFiltersService } from 'app-shared/content-shared/entries-refine-filters/entries-refine-filters.service';
import { EntriesTableComponent } from 'app-shared/content-shared/entries-table/entries-table.component';
import { EntriesListComponent } from 'app-shared/content-shared/entries-list/entries-list.component';
import { TagsModule } from '@kaltura-ng/kaltura-ui/tags';
import { PrimeTableSortTransformPipe } from 'app-shared/content-shared/pipes/prime-table-sort-transform.pipe';
import { ModerationPipe } from './pipes/moderation.pipe';
import { EntriesSelectorComponent } from 'app-shared/content-shared/entries-selector/entries-selector.component';
import { EntriesListTagsComponent } from 'app-shared/content-shared/entries-list/entries-list-tags.component';
import { FiltersModule } from '@kaltura-ng/mc-shared/filters';
import { EntriesTotalDurationPipe } from 'app-shared/content-shared/pipes/entries-total-duration.pipe';
import { SliderModule } from '@kaltura-ng/kaltura-primeng-ui/slider/slider.module';
import { DefaultEntriesDataProvider, EntriesDataProviderToken } from 'app-shared/content-shared/entries-store/defaultEntriesDataProvider';

@NgModule({
  imports: [
    AreaBlockerModule,
    TooltipModule,
    AutoCompleteModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TreeModule,
    PrimeTreeModule,
    KalturaCommonModule,
    KalturaPrimeNgUIModule,
    KalturaUIModule,
    ButtonModule,
    CalendarModule,
    RadioButtonModule,
    CheckboxModule,
    PopupWidgetModule,
    DataTableModule,
    MenuModule,
    TagsModule,
    PaginatorModule,
    TieredMenuModule,
    InputTextModule,
    FiltersModule,
    StickyModule,
    DropdownModule,
    SliderModule
  ],
  declarations: [
    EntryStatusPipe,
    EntryTypePipe,
    CategoriesTreeComponent,
    SchedulingComponent,
    EntryDurationPipe,
    MaxEntriesPipe,
    EntriesTotalDurationPipe,
    PrimeTableSortDirectionPipe,
    PrimeTableSortTransformPipe,
    ModerationPipe,
    EntriesRefineFiltersComponent,
    CategoriesFilterPrefsComponent,
    CategoriesFilterComponent,
    EntriesTableComponent,
    EntriesListComponent,
    EntriesListTagsComponent,
    EntriesSelectorComponent
  ],
  exports: [
    EntryStatusPipe,
    EntryTypePipe,
    ModerationPipe,
    MaxEntriesPipe,
    CategoriesTreeComponent,
    SchedulingComponent,
    EntriesListComponent,
    EntryDurationPipe,
    PrimeTableSortDirectionPipe,
    EntriesRefineFiltersComponent,
    CategoriesFilterPrefsComponent,
    CategoriesFilterComponent,
    EntriesTableComponent,
    EntriesListComponent,
    EntriesSelectorComponent
  ],
  providers: [
    EntriesRefineFiltersService,
    CategoriesSearchService,
    {
      provide: EntriesDataProviderToken,
      useClass: DefaultEntriesDataProvider
    }
  ]
})
export class ContentSharedModule {
}
