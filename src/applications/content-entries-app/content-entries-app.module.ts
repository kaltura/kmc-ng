import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TagsModule } from '@kaltura-ng/kaltura-ui/tags';
import { TreeModule, TieredMenuModule,  SharedModule,   AccordionModule,  ButtonModule, InputTextareaModule, PaginatorModule, InputTextModule, MenuModule, DataTableModule, DropdownModule, RadioButtonModule, MultiSelectModule, CheckboxModule, CalendarModule, SpinnerModule, ConfirmDialogModule, ConfirmationService } from 'primeng/primeng';
import { KMCShellModule } from 'app-shared/kmc-shell';

import { routing } from './content-entries-app.routes';
import { ContentEntriesComponent } from './content-entries.component';

import { MetadataProfileModule } from '@kaltura-ng/kaltura-server-utils';

import { KalturaCommonModule } from '@kaltura-ng/kaltura-common';
import { KalturaPrimeNgUIModule } from '@kaltura-ng/kaltura-primeng-ui';
import { PrimeTreeModule } from '@kaltura-ng/kaltura-primeng-ui/prime-tree';
import { KalturaUIModule, TooltipModule } from '@kaltura-ng/kaltura-ui';
import { AutoCompleteModule } from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui/popup-widget';

import { AreaBlockerModule } from '@kaltura-ng/kaltura-ui';
import { DynamicFormModule } from '@kaltura-ng/kaltura-ui/dynamic-form';
import { DynamicFormModule as PrimeDynamicFormModule } from '@kaltura-ng/kaltura-primeng-ui/dynamic-form';
import { DynamicMetadataFormModule } from '@kaltura-ng/kaltura-server-utils';
import { EntryComponentsList } from './entry/entry-components-list';
import { EntriesComponentsList } from './entries/entries-components-list';
import { CategoriesStore } from './shared/categories-store.service';
import { EntriesRefineFiltersProvider } from './entries/entries-refine-filters/entries-refine-filters-provider.service';
import { CategoriesPrimeService } from './shared/categories-prime.service';
import { BulkSchedulingService, BulkAccessControlService, BulkAddTagsService, BulkRemoveTagsService, BulkAddCategoriesService, BulkChangeOwnerService, BulkRemoveCategoriesService, BulkDeleteService, BulkDownloadService } from './entries/bulk-actions/services';
import { SharedComponentsList } from './shared/shared-components-list';
import { EntryCanDeactivate } from './entry/entry-can-deactivate.service';

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
        TreeModule
    ],
    declarations: [
        ContentEntriesComponent,
        EntryComponentsList,
        EntriesComponentsList,
        SharedComponentsList
    ],
    exports: [],
    providers: [
        ConfirmationService,
        CategoriesStore,
        CategoriesPrimeService,
        EntriesRefineFiltersProvider,
        BulkSchedulingService,
        BulkAccessControlService,
        BulkAddTagsService,
        BulkRemoveTagsService,
        BulkAddCategoriesService,
        BulkChangeOwnerService,
        BulkRemoveCategoriesService,
        BulkDeleteService,
        BulkDownloadService,
        EntryCanDeactivate
    ],
})
export class ContentEntriesAppModule {
}
