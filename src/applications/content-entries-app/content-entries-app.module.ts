import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TagsModule } from '@kaltura-ng2/kaltura-ui/tags';
import {
     TreeModule, TieredMenuModule,  SharedModule,   AccordionModule,  ButtonModule, InputTextareaModule, PaginatorModule, InputTextModule, MenuModule, DataTableModule, DropdownModule, RadioButtonModule, MultiSelectModule, CheckboxModule, CalendarModule, SpinnerModule, ConfirmDialogModule, ConfirmationService, GrowlModule } from 'primeng/primeng';
import { KMCShellModule } from 'kmc-shell';
import { TreeSelectionModule } from '@kaltura-ng2/kaltura-primeng-ui/tree-selection';

import { routing } from './content-entries-app.routes';
import { ContentEntriesComponent } from './content-entries.component';

import { MetadataProfileStore } from '@kaltura-ng2/kaltura-common';

import { KalturaCommonModule } from '@kaltura-ng2/kaltura-common';
import { KalturaPrimeNgUIModule } from '@kaltura-ng2/kaltura-primeng-ui';
import { KalturaUIModule, TooltipModule } from '@kaltura-ng2/kaltura-ui';
import { AutoCompleteModule } from '@kaltura-ng2/kaltura-primeng-ui/auto-complete';
import { PopupWidgetModule } from '@kaltura-ng2/kaltura-ui/popup-widget';

import { AreaBlockerModule } from '@kaltura-ng2/kaltura-ui';
import { DynamicFormModule } from '@kaltura-ng2/kaltura-ui/dynamic-form';
import { DynamicFormModule as PrimeDynamicFormModule } from '@kaltura-ng2/kaltura-primeng-ui/dynamic-form';
import { KalturaCustomMetadataModule } from '@kaltura-ng2/kaltura-ui/dynamic-form/kaltura-custom-metadata';
import { EntryComponentsList } from './entry/entry-components-list';
import { EntriesComponentsList } from './entries/entries-components-list';
import { CategoriesStore } from './shared/categories-store.service';
import { EntriesAdditionalFiltersStore } from './entries/entries-additional-filters/entries-additional-filters-store.service';
import { CategoriesPrimeService } from './shared/categories-prime.service';
import { SharedComponentsList } from './shared/shared-components-list';

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
        GrowlModule,
        InputTextareaModule,
        InputTextModule,
        KalturaCommonModule,
        KalturaCustomMetadataModule,
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
        TreeSelectionModule,
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
        MetadataProfileStore,
        EntriesAdditionalFiltersStore
    ],
})
export class ContentEntriesAppModule {
}