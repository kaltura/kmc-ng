import {LinkedEntriesPopup} from './category-entry-selector/linked-entries-popup.component';
import {LinkedEntries} from '././category-entry-selector/linked-entries.component';
import {JumpToSection} from './category-metadata/jump-to-section.component';
import {CategoryDetailsComponent} from './category-details/category-details.component';
import {CategorySectionsListComponent} from './category-sections-list/category-sections-list.component';
import {CategorySubcategoriesComponent} from './category-subcategories/category-subcategories.component';
import {CategoryMetadataComponent} from './category-metadata/category-metadata.component';
import {CategoryEntitlementsComponent} from './category-entitlements/category-entitlements.component';
import {CategoryComponent} from './category.component';
import {CategorySubcategoriesTableComponent} from './category-subcategories/category-subcategories-table/category-subcategories-table.component';
import {BulkOperationsComponent} from './category-subcategories/bulk-operations/bulk-operations.component';
import {NewSubcategoryComponent} from './category-subcategories/new-category/new-subcategory.component';
import {CategoryChangeOwnerComponent} from './category-entitlements/change-owner/change-owner.component';
import {ManageEndUserPermissionsComponent} from './category-entitlements/manage-end-user-permissions/manage-end-user-permissions.component';
import {ManageEndUserPermissionsTableComponent} from './category-entitlements/manage-end-user-permissions/manage-end-user-permissions-table/manage-end-user-permissions-table.component';
import {CategoryUserStatusPipe} from './category-entitlements/manage-end-user-permissions/manage-end-user-permissions-table/category-user-status.pipe';
import {ManageEndUserPermissionsBulkOperationsComponent} from './category-entitlements/manage-end-user-permissions/bulk-operations/bulk-operations.component';
import {AddUsersComponent} from './category-entitlements/manage-end-user-permissions/add-users/add-users.component';
import {ManageEndUserPermissionsRefineFiltersComponent} from './category-entitlements/manage-end-user-permissions/manage-end-user-permissions-refine-filters/manage-end-user-permissions-refine-filters.component';
import {ManageEndUserPermissionsFilterTagsComponent} from './category-entitlements/manage-end-user-permissions/manage-end-user-permissions-filter-tags/manage-end-user-permissions-filter-tags.component';

export const CategoryComponentsList = [
    CategoryComponent,
    CategoryEntitlementsComponent,
    CategoryMetadataComponent,
    CategorySubcategoriesComponent,
    NewSubcategoryComponent,
    BulkOperationsComponent,
    CategorySubcategoriesTableComponent,
    CategorySectionsListComponent,
    CategoryDetailsComponent,
    CategoryEntitlementsComponent,
    CategoryChangeOwnerComponent,
    JumpToSection,
    LinkedEntriesPopup,
    LinkedEntries,
    ManageEndUserPermissionsComponent,
    ManageEndUserPermissionsTableComponent,
    ManageEndUserPermissionsRefineFiltersComponent,
    ManageEndUserPermissionsFilterTagsComponent,
    CategoryUserStatusPipe,
    ManageEndUserPermissionsBulkOperationsComponent,
    AddUsersComponent
];
