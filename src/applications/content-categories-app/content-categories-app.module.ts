import { CategoriesBulkAddTagsService,
    CategoriesBulkRemoveTagsService,
    CategoriesBulkChangeOwnerService,
    CategoriesBulkDeleteService,
    CategoriesBulkChangeContentPrivacyService,
    CategoriesBulkChangeCategoryListingService,
    CategoriesBulkChangeContributionPolicyService } from './categories/bulk-actions/services';
import { CategoriesBulkActionsComponent } from './categories/bulk-actions/categories-bulk-actions.component';
import { ContentSharedModule } from 'app-shared/content-shared/content-shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TagsModule } from '@kaltura-ng/kaltura-ui/tags';
import { TreeModule, TieredMenuModule, SharedModule, AccordionModule, ButtonModule, InputTextareaModule, PaginatorModule, InputTextModule, MenuModule, DataTableModule, DropdownModule, RadioButtonModule, MultiSelectModule, CheckboxModule, CalendarModule, SpinnerModule, ConfirmDialogModule } from 'primeng/primeng';
import { KMCShellModule } from 'app-shared/kmc-shell';

import { routing } from './content-categories-app.routes';
import { ContentCategoriesComponent } from './content-categories.component';

import { MetadataProfileModule } from '@kaltura-ng/kaltura-server-utils';

import { KalturaCommonModule } from '@kaltura-ng/kaltura-common';
import { KalturaPrimeNgUIModule } from '@kaltura-ng/kaltura-primeng-ui';
import { PrimeTreeModule, PrimeTreePropagation } from '@kaltura-ng/kaltura-primeng-ui/prime-tree';
import { KalturaUIModule, TooltipModule, StickyModule } from '@kaltura-ng/kaltura-ui';
import { AutoCompleteModule } from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui/popup-widget';

import { AreaBlockerModule } from '@kaltura-ng/kaltura-ui';
import { DynamicFormModule } from '@kaltura-ng/kaltura-ui/dynamic-form';
import { DynamicFormModule as PrimeDynamicFormModule } from '@kaltura-ng/kaltura-primeng-ui/dynamic-form';
import { DynamicMetadataFormModule } from '@kaltura-ng/kaltura-server-utils';
import { CategoryComponentsList } from './category/category-components-list';
import { CategoriesComponentsList } from './categories/categories-components-list';
import { CategoryCanDeactivate } from "./category/category-can-deactivate.service";

@NgModule({
    imports: [
        AccordionModule,
        AreaBlockerModule,
        AutoCompleteModule,
        ButtonModule,
        CalendarModule,
        CheckboxModule,
        CommonModule,
        ConfirmDialogModule,
        DataTableModule,
        DropdownModule,
        DynamicFormModule,
        FormsModule,
        InputTextareaModule,
        InputTextModule,
        KalturaCommonModule,
        MetadataProfileModule,
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
        PrimeTreeModule,
        SpinnerModule,
        TagsModule,
        TieredMenuModule,
        TooltipModule,
        TreeModule,
        ContentSharedModule,
        StickyModule
    ],
    declarations: [
        ContentCategoriesComponent,
        CategoryComponentsList,
        CategoriesComponentsList,
        CategoriesBulkActionsComponent
    ],
    exports: [],
    providers: [CategoryCanDeactivate,
        CategoriesBulkAddTagsService,
        CategoriesBulkRemoveTagsService,
        CategoriesBulkChangeOwnerService,
        CategoriesBulkDeleteService,
        CategoriesBulkChangeContentPrivacyService,
        CategoriesBulkChangeContributionPolicyService,
        CategoriesBulkChangeCategoryListingService]
})
export class ContentCategoriesAppModule {
}
