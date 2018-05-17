import {CategoriesBulkChangeOwner} from './bulk-actions/components/bulk-change-owner/bulk-change-owner.component';
import {CategoriesBulkRemoveTags} from './bulk-actions/components/bulk-remove-tags/bulk-remove-tags.component';
import {CategoriesBulkAddTags} from './bulk-actions/components/bulk-add-tags/bulk-add-tags.component';
import {CategoriesTableComponent} from './categories-table/categories-table.component';
import {CategoriesListComponent} from './categories-list/categories-list.component';
import {CategoriesBulkActionsComponent} from './bulk-actions/categories-bulk-actions.component';
import {CategoriesBulkChangeContentPrivacy} from './bulk-actions/components/bulk-change-content-privacy/bulk-change-content-privacy.component';
import {CategoriesBulkChangeCategoryListing} from './bulk-actions/components/bulk-change-category-listing/bulk-change-category-listing.component';
import {CategoriesBulkChangeContributionPolicy} from './bulk-actions/components/bulk-change-contribution-policy/bulk-change-contribution-policy.component';
import {CategoriesListTagsComponent} from './categories-list/categories-list-tags.component';
import {CategoriesRefineFiltersComponent} from './categories-refine-filters/categories-refine-filters.component';

export const CategoriesComponentsList = [
    CategoriesListComponent,
    CategoriesTableComponent,
    CategoriesListTagsComponent,
    CategoriesRefineFiltersComponent,
    CategoriesBulkActionsComponent,
    CategoriesBulkAddTags,
    CategoriesBulkRemoveTags,
    CategoriesBulkChangeOwner,
    CategoriesBulkChangeContentPrivacy ,
    CategoriesBulkChangeCategoryListing,
    CategoriesBulkChangeContributionPolicy
];
