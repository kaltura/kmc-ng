import { CategoriesBulkAddTags } from './bulk-actions/components/bulk-add-tags/bulk-add-tags.component';
import { CategoriesTableComponent } from './categories-table.component';
import { CategoriesListComponent } from "./categories-list.component";
import { MaxCategoriesPipe } from './pipes/max-categories.pipe';
import { CategoriesBulkActionsComponent } from './bulk-actions/categories-bulk-actions.component';
import { PrimeTableSortDirectionPipe } from './pipes/prime-table-sort-direction.pipe';


export const CategoriesComponentsList = [
    CategoriesListComponent,
    CategoriesTableComponent,
    MaxCategoriesPipe,
    CategoriesBulkActionsComponent,
    PrimeTableSortDirectionPipe,
    CategoriesBulkAddTags
];