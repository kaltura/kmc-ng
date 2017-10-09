import { LinkedEntriesPopup } from './category-entry-selector/linked-entries-popup.component';
import { LinkedEntries } from '././category-entry-selector/linked-entries.component';
import { JumpToSection } from './category-metadata/jump-to-section.component';
import { CategoryPreviewComponent } from './category-preview/category-preview.component';
import { CategorySectionsListComponent } from './category-sections-list/category-sections-list.component';
import { CategorySubcategoriesComponent } from './category-subcategories/category-subcategories.component';
import { CategoryMetadataComponent } from './category-metadata/category-metadata.component';
import { CategoryEntitlementsComponent } from './category-entitlements/category-entitlements.component';
import { CategoryComponent } from './category.component';

export const CategoryComponentsList = [
    CategoryComponent,
    CategoryEntitlementsComponent,
    CategoryMetadataComponent,
    CategorySubcategoriesComponent,
    CategorySectionsListComponent,
    CategoryPreviewComponent,
    JumpToSection,
    LinkedEntriesPopup,
    LinkedEntries
];