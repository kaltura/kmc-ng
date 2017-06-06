import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TagsModule } from '@kaltura-ng2/kaltura-ui/tags';
import {
     TreeModule, TieredMenuModule,  SharedModule,   AccordionModule,  ButtonModule, InputTextareaModule, PaginatorModule, InputTextModule, MenuModule, DataTableModule, DropdownModule, RadioButtonModule, MultiSelectModule, CheckboxModule, CalendarModule, SpinnerModule, ConfirmDialogModule, ConfirmationService, GrowlModule } from 'primeng/primeng';
import { KMCShellModule } from 'kmc-shell';
import { TreeSelectionModule } from '@kaltura-ng2/kaltura-primeng-ui/tree-selection';

import { routing } from './content-playlists-app.routes';
import { ContentPlaylistsComponent } from './content-playlists.component';

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
		ContentPlaylistsComponent
    ],
    exports: [],
    providers: [
        ConfirmationService,
        MetadataProfileStore
    ],
})
export class ContentPlaylistsAppModule {
}
