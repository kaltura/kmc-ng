import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AreaBlockerModule, KalturaUIModule, StickyModule, TooltipModule} from '@kaltura-ng/kaltura-ui';
import {TableModule} from 'primeng/table';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LocalizationModule} from '@kaltura-ng/mc-shared';
import {AutoCompleteModule, KalturaPrimeNgUIModule, KPTableModule} from '@kaltura-ng/kaltura-primeng-ui';
import {PopupWidgetModule} from '@kaltura-ng/kaltura-ui';

import {EntryStatusPipe} from './pipes/entry-status.pipe';
import {SchedulingComponent} from './scheduling/scheduling.component';
import {EntryTypePipe} from './pipes/entry-type.pipe';
import {EntryDurationPipe} from './pipes/entry-duration.pipe';
import {MaxEntriesPipe} from './pipes/max-entries.pipe';
import {EntriesRefineFiltersComponent} from './entries-refine-filters/entries-refine-filters.component';
import {EntriesTableComponent} from './entries-table/entries-table.component';
import {EntriesListComponent} from './entries-list/entries-list.component';
import {TagsModule} from '@kaltura-ng/kaltura-ui';
import {PrimeTableSortTransformPipe} from './pipes/prime-table-sort-transform.pipe';
import {ModerationPipe} from './pipes/moderation.pipe';
import {EntriesSelectorComponent} from './entries-selector/entries-selector.component';
import {EntriesListTagsComponent} from './entries-list/entries-list-tags.component';
import {FiltersModule} from '@kaltura-ng/mc-shared';
import {CategoriesModule} from '../categories/categories.module';
import {EntriesStoreDataProvider} from 'app-shared/content-shared/entries/entries-store/entries-store-data-provider.service';
import {EntriesDataProviderToken} from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import {LiveDashboardComponent} from 'app-shared/content-shared/entries/live-dashboard/live-dashboard.component';
import {LiveDashboardHostComponent} from 'app-shared/content-shared/entries/live-dashboard-host/live-dashboard-host.component';
import { LinkedEntriesTableComponent } from './link-entries-selector/linked-entries-table/linked-entries-table.component';
import { LinkedEntriesAddEntriesComponent } from './link-entries-selector/linked-entries-add-entries/linked-entries-add-entries.component';
import {LinkedEntriesComponent} from './link-entries-selector/linked-entries/linked-entries.component';
import { KMCPermissionsModule } from 'app-shared/kmc-shared/kmc-permissions';
import { DateFormatModule } from 'app-shared/kmc-shared/date-format/date-format.module';
import { TreeModule } from 'primeng/tree';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { MenuModule } from 'primeng/menu';
import { PaginatorModule } from 'primeng/paginator';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { InputTextModule } from 'primeng/inputtext';
import { EntriesSearchFiltersComponent } from "app-shared/content-shared/entries/entries-search-filters/entries-search-filters.component";

@NgModule({
  imports: [
    AreaBlockerModule,
    TooltipModule,
    AutoCompleteModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TreeModule,
    LocalizationModule,
    KalturaPrimeNgUIModule,
    KPTableModule,
    KalturaUIModule,
    DropdownModule,
    ButtonModule,
    CalendarModule,
    RadioButtonModule,
    CheckboxModule,
    PopupWidgetModule,
    TableModule,
    MenuModule,
    TagsModule,
    PaginatorModule,
    TieredMenuModule,
    InputTextModule,
    StickyModule,
    FiltersModule,
    CategoriesModule,
    KMCPermissionsModule,
      DateFormatModule
  ],
  declarations: [
    EntryStatusPipe,
    EntryTypePipe,
    SchedulingComponent,
    EntryDurationPipe,
    MaxEntriesPipe,
    PrimeTableSortTransformPipe,
    ModerationPipe,
    EntriesRefineFiltersComponent,
    EntriesSearchFiltersComponent,
    EntriesTableComponent,
    EntriesListComponent,
    EntriesListTagsComponent,
    EntriesSelectorComponent,
    LiveDashboardComponent,
    LiveDashboardHostComponent,
    LinkedEntriesComponent,
    LinkedEntriesTableComponent,
    LinkedEntriesAddEntriesComponent
  ],
  exports: [
    EntryStatusPipe,
    EntryTypePipe,
    ModerationPipe,
    MaxEntriesPipe,
    SchedulingComponent,
    EntryDurationPipe,
    EntriesRefineFiltersComponent,
    EntriesTableComponent,
    EntriesListComponent,
    EntriesSelectorComponent,
    LiveDashboardComponent,
    LiveDashboardHostComponent,
	  LinkedEntriesComponent,
	  LinkedEntriesTableComponent,
	  LinkedEntriesAddEntriesComponent
  ]
})
export class EntriesModule {
    static forRoot(): ModuleWithProviders<EntriesModule> {
        return {
            ngModule: EntriesModule,
            providers: [
                { provide: EntriesDataProviderToken, useClass: EntriesStoreDataProvider }
            ]
        };
    }
}
