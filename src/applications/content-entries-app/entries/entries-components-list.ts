import { EntriesTableComponent } from './entries-table.component';
import { EntriesListComponent } from "./entries-list.component";
import { CategoriesFilterComponent } from './categories-filter/categories-filter.component';
import { CategoriesFilterPrefsComponent } from './categories-filter-preferences/categories-filter-preferences.component';
import { MaxEntriesPipe } from './pipes/max-entries.pipe';
import { EntryDurationPipe } from './pipes/entry-duration.pipe';
import {
    EntriesAdditionalFiltersComponent
} from "./entries-additional-filters/entries-additional-filters.component";
import { CategoriesFilterSelection } from './categories-filter/categories-filter-selection.directive';

export const EntriesComponentsList = [
    EntriesListComponent,
    EntriesTableComponent,
    CategoriesFilterComponent,
    CategoriesFilterPrefsComponent,
    EntriesAdditionalFiltersComponent,
    MaxEntriesPipe,
    EntryDurationPipe,
    CategoriesFilterSelection
];