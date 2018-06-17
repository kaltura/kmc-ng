import {
  CategoriesBulkAddTagsService,
  CategoriesBulkChangeCategoryListingService,
  CategoriesBulkChangeContentPrivacyService,
  CategoriesBulkChangeContributionPolicyService,
  CategoriesBulkChangeOwnerService,
  CategoriesBulkDeleteService,
  CategoriesBulkRemoveTagsService
} from './categories/bulk-actions/services';
import {CategoriesBulkActionsComponent} from './categories/bulk-actions/categories-bulk-actions.component';
import {CategoriesModule} from 'app-shared/content-shared/categories/categories.module';

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {TagsModule} from '@kaltura-ng/kaltura-ui';
import {
  AccordionModule,
  ButtonModule,
  CalendarModule,
  CheckboxModule,
  ConfirmDialogModule,
  DataTableModule,
  DropdownModule,
  InputSwitchModule,
  InputTextareaModule,
  InputTextModule,
  MenuModule,
  MultiSelectModule,
  PaginatorModule,
  RadioButtonModule,
  SharedModule,
  SpinnerModule,
  TieredMenuModule,
  TreeModule,
} from 'primeng/primeng';
import {TableModule} from 'primeng/table';
import {KMCShellModule} from 'app-shared/kmc-shell';

import {routing} from './content-categories-app.routes';
import {ContentCategoriesComponent} from './content-categories.component';

import {DynamicMetadataFormModule} from 'app-shared/kmc-shared';

import {LocalizationModule} from '@kaltura-ng/mc-shared';

import {KalturaPrimeNgUIModule} from '@kaltura-ng/kaltura-primeng-ui';
import {
  AreaBlockerModule,
  InputHelperModule,
  KalturaUIModule,
  StickyModule,
  TooltipModule
} from '@kaltura-ng/kaltura-ui';
import {AutoCompleteModule} from '@kaltura-ng/kaltura-primeng-ui';
import {PopupWidgetModule} from '@kaltura-ng/kaltura-ui';
import {DynamicFormModule} from '@kaltura-ng/kaltura-ui';
import {DynamicFormModule as PrimeDynamicFormModule} from '@kaltura-ng/kaltura-primeng-ui';
import {CategoryComponentsList} from './category/category-components-list';
import {CategoriesComponentsList} from './categories/categories-components-list';
import {CategoryCanDeactivate} from './category/category-can-deactivate.service';
import {DetailsBarModule} from '@kaltura-ng/kaltura-ui';
import {CategoriesUtilsService} from './categories-utils.service';
import {NewCategoryComponent} from './categories/new-category/new-category.component';
import {MoveCategoryComponent} from './categories/move-category/move-category.component';
import {CategoriesRefineFiltersService} from './categories/categories-refine-filters.service';
import { FiltersModule } from '@kaltura-ng/mc-shared';
import { KMCPermissionsModule } from 'app-shared/kmc-shared/kmc-permissions';
import { EntriesModule } from 'app-shared/content-shared/entries/entries.module';

@NgModule({
    imports: [
        FiltersModule,
        AccordionModule,
        AreaBlockerModule,
        AutoCompleteModule,
        ButtonModule,
        CalendarModule,
        CheckboxModule,
        CommonModule,
        ConfirmDialogModule,
        CategoriesModule,
        DataTableModule,
        DropdownModule,
        DynamicFormModule,
        FormsModule,
        InputTextareaModule,
        InputTextModule,
        LocalizationModule,
        DynamicMetadataFormModule,
        KalturaPrimeNgUIModule,
        KalturaUIModule,
        KMCShellModule,
        MenuModule,
        MultiSelectModule,
        PaginatorModule,
        PopupWidgetModule,
        PrimeDynamicFormModule,
        RadioButtonModule,
        ReactiveFormsModule,
        RouterModule.forChild(routing),
        SharedModule,
        SpinnerModule,
        TagsModule,
        TieredMenuModule,
        TooltipModule,
        TreeModule,
        DetailsBarModule,
        StickyModule,
        InputHelperModule,
        InputSwitchModule,
        TableModule,
        KMCPermissionsModule,
	    EntriesModule,
    ],
    declarations: [
        ContentCategoriesComponent,
        CategoryComponentsList,
        CategoriesComponentsList,
        CategoriesBulkActionsComponent,
        MoveCategoryComponent,
        NewCategoryComponent
    ],
    exports: [],
    providers: [CategoryCanDeactivate,
        CategoriesBulkAddTagsService,
        CategoriesBulkRemoveTagsService,
        CategoriesBulkChangeOwnerService,
        CategoriesBulkDeleteService,
        CategoriesBulkChangeContentPrivacyService,
        CategoriesBulkChangeContributionPolicyService,
        CategoriesBulkChangeCategoryListingService,
        CategoriesUtilsService]
})
export class ContentCategoriesAppModule {
}
