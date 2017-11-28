import {LinkedEntriesPopup} from './category-entry-selector/linked-entries-popup.component';
import {LinkedEntries} from '././category-entry-selector/linked-entries.component';
import {JumpToSection} from './category-metadata/jump-to-section.component';
import {CategoryDetailsComponent} from './category-details/category-details.component';
import {CategorySectionsListComponent} from './category-sections-list/category-sections-list.component';
import {CategorySubcategoriesComponent} from './category-subcategories/category-subcategories.component';
import {CategoryMetadataComponent} from './category-metadata/category-metadata.component';
import {CategoryEntitlementsComponent} from './category-entitlements/category-entitlements.component';
import {CategoryComponent} from './category.component';
import {CategoryChangeOwnerComponent} from "./category-entitlements/change-owner/change-owner.component";

export const CategoryComponentsList = [
    CategoryComponent,
    CategoryEntitlementsComponent,
    CategoryMetadataComponent,
    CategorySubcategoriesComponent,
    CategorySectionsListComponent,
    CategoryDetailsComponent,
    CategoryEntitlementsComponent,
    CategoryChangeOwnerComponent,
    JumpToSection,
    LinkedEntriesPopup,
    LinkedEntries
];
