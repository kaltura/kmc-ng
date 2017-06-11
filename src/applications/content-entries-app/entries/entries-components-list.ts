import { EntriesTableComponent } from './entries-table.component';
import { EntriesListComponent } from "./entries-list.component";
import { CategoriesFilterComponent } from './categories-filter/categories-filter.component';
import { CategoriesFilterPrefsComponent } from './categories-filter-preferences/categories-filter-preferences.component';
import { MaxEntriesPipe } from './pipes/max-entries.pipe';
import { EntryDurationPipe } from './pipes/entry-duration.pipe';

import { PrimeTableSortDirectionPipe } from './pipes/prime-table-sort-direction.pipe';
import { EntriesRefineFilters } from './entries-refine-filters/entries-refine-filters.component';

export const EntriesComponentsList = [
    EntriesListComponent,
    EntriesTableComponent,
    CategoriesFilterComponent,
    CategoriesFilterPrefsComponent,
    EntriesRefineFilters,
    MaxEntriesPipe,
    EntryDurationPipe,
    PrimeTableSortDirectionPipe
];