import { ModuleWithProviders, NgModule } from '@angular/core';
import {CommonModule} from '@angular/common';
import {AreaBlockerModule, KalturaUIModule, StickyModule, TooltipModule} from '@kaltura-ng/kaltura-ui';

import {
  ButtonModule,
  CalendarModule,
  CheckboxModule,
  DataTableModule,
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

import { EntryStatusPipe } from './pipes/entry-status.pipe';
import { SchedulingComponent } from './scheduling/scheduling.component';
import { EntryTypePipe } from './pipes/entry-type.pipe';
import { EntryDurationPipe } from './pipes/entry-duration.pipe';
import { MaxEntriesPipe } from './pipes/max-entries.pipe';
import { EntriesTableSortDirectionPipe } from './pipes/entries-table-sort-direction.pipe';
import { EntriesRefineFiltersComponent } from './entries-refine-filters/entries-refine-filters.component';
import { EntriesTableComponent } from './entries-table/entries-table.component';
import { EntriesListComponent } from './entries-list/entries-list.component';
import { TagsModule } from '@kaltura-ng/kaltura-ui/tags';
import { PrimeTableSortTransformPipe } from './pipes/prime-table-sort-transform.pipe';
import { ModerationPipe } from './pipes/moderation.pipe';
import { EntriesSelectorComponent } from './entries-selector/entries-selector.component';
import { EntriesListTagsComponent } from './entries-list/entries-list-tags.component';
import { FiltersModule } from '@kaltura-ng/mc-shared/filters';
import { CategoriesModule } from '../categories/categories.module';

@NgModule({
  imports: [
    AreaBlockerModule,
    TooltipModule,
    AutoCompleteModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TreeModule,
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
    StickyModule,
    FiltersModule,
      CategoriesModule
  ],
  declarations: [
    EntryStatusPipe,
    EntryTypePipe,
    SchedulingComponent,
    EntryDurationPipe,
    MaxEntriesPipe,
      EntriesTableSortDirectionPipe,
    PrimeTableSortTransformPipe,
    ModerationPipe,
    EntriesRefineFiltersComponent,
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
    SchedulingComponent,
    EntriesListComponent,
    EntryDurationPipe,
      EntriesTableSortDirectionPipe,
    EntriesRefineFiltersComponent,
    EntriesTableComponent,
    EntriesListComponent,
    EntriesSelectorComponent
  ]
})
export class EntriesModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: EntriesModule,
            providers: <any[]>[
            ]
        };
    }
}
