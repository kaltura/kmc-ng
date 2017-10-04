import { CategoriesTableComponent } from './categories-table.component';
import { CategoriesListComponent } from "./categories-list.component";
import { MaxCategoriesPipe } from './pipes/max-categories.pipe';
import { CategoriesBulkActionsComponent } from './bulk-actions/categories-bulk-actions.component';
import { PrimeTableSortDirectionPipe } from './pipes/prime-table-sort-direction.pipe';
import { AddNewCategory } from "./add-new-category/add-new-category.component";

export const CategoriesComponentsList = [
    CategoriesListComponent,
    CategoriesTableComponent,
    MaxCategoriesPipe,
    CategoriesBulkActionsComponent,
    PrimeTableSortDirectionPipe,
    AddNewCategory
];