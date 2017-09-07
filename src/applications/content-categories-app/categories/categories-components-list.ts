import { CategoriesBulkChangeOwner } from "applications/content-categories-app/categories/bulk-actions/components/bulk-change-owner/bulk-change-owner.component";
import { CategoriesBulkRemoveTags } from './bulk-actions/components/bulk-remove-tags/bulk-remove-tags.component';
import { CategoriesBulkAddTags } from './bulk-actions/components/bulk-add-tags/bulk-add-tags.component';
import { CategoriesTableComponent } from './categories-table.component';
import { CategoriesListComponent } from "./categories-list.component";
import { MaxCategoriesPipe } from './pipes/max-categories.pipe';
import { CategoriesBulkActionsComponent } from './bulk-actions/categories-bulk-actions.component';
import { PrimeTableSortDirectionPipe } from './pipes/prime-table-sort-direction.pipe';
import { CategoriesBulkChangeContentPrivacy } from "applications/content-categories-app/categories/bulk-actions/components/bulk-change-content-privacy/bulk-change-content-privacy.component";
import { CategoriesBulkChangeCategoryListing } from "applications/content-categories-app/categories/bulk-actions/components/bulk-change-category-listing/bulk-change-category-listing.component";
import { CategoriesBulkChangeCategoriesContribution } from "applications/content-categories-app/categories/bulk-actions/components/bulk-change-categories-contribution/bulk-change-categories-contribution.component";

export const CategoriesComponentsList = [
    CategoriesListComponent,
    CategoriesTableComponent,
    MaxCategoriesPipe,
    CategoriesBulkActionsComponent,
    PrimeTableSortDirectionPipe,
    CategoriesBulkAddTags,
    CategoriesBulkRemoveTags,
    CategoriesBulkChangeOwner,
    CategoriesBulkChangeContentPrivacy ,
    CategoriesBulkChangeCategoryListing,
    CategoriesBulkChangeCategoriesContribution
];