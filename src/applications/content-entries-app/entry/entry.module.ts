import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MultiSelectModule, ButtonModule, TooltipModule, InputTextareaModule, PaginatorModule, InputTextModule, MenuModule, DataTableModule, DropdownModule, RadioButtonModule,
	CheckboxModule, CalendarModule, SpinnerModule, ConfirmDialogModule, ConfirmationService, GrowlModule } from 'primeng/primeng';

import { KalturaCommonModule } from '@kaltura-ng2/kaltura-common';
import { KalturaPrimeNgUIModule } from '@kaltura-ng2/kaltura-primeng-ui';
import { KalturaUIModule, ToolTipModule as newToolTipModule } from '@kaltura-ng2/kaltura-ui';
import { AutoCompleteModule } from '@kaltura-ng2/kaltura-primeng-ui/auto-complete';
import { PopupWidgetModule } from '@kaltura-ng2/kaltura-ui/popup-widget';

import { KMCContentUIModule } from "kmc-content-ui/kmc-content-ui.module";

import { EntryMetadata } from "./entry-metadata/entry-metadata.component";
import { EntryThumbnails } from "./entry-thumbnails/entry-thumbnails.component";
import { EntryAccessControl } from "./entry-access-control/entry-access-control.component";
import { EntryScheduling } from "./entry-scheduling/entry-scheduling.component";
import { EntryFlavours } from "./entry-flavours/entry-flavours.component";
import { EntryCaptions } from "./entry-captions/entry-captions.component";
import { EntryCaptionsEdit } from "./entry-captions/entry-captions-edit.component";
import { EntryLive } from "./entry-live/entry-live.component";
import { EntryRelated } from "./entry-related/entry-related.component";
import { EntryRelatedEdit } from "./entry-related/entry-related-edit.component";
import { EntryClips } from "./entry-clips/entry-clips.component";
import { EntryUsers } from "./entry-users/entry-users.component";
import { EntrySectionsList } from "./entry-sections-list/entry-sections-list.component";
import { EntryComponent } from './entry.component';
import { EntryPreview } from './entry-preview/entry-preview.component';
import { DynamicFormModule } from '@kaltura-ng2/kaltura-ui/dynamic-form';
import { DynamicFormModule as PrimeDynamicFormModule } from '@kaltura-ng2/kaltura-primeng-ui/dynamic-form';
import { KalturaCustomMetadataModule } from '@kaltura-ng2/kaltura-ui/dynamic-form/kaltura-custom-metadata';

@NgModule({
    imports: [
        AutoCompleteModule,
        ButtonModule,
        CalendarModule,
        CheckboxModule,
        CommonModule,
        DataTableModule,
        DropdownModule,
        DynamicFormModule,
        FormsModule,
        InputTextareaModule,
        InputTextModule,
	    ConfirmDialogModule,
        KalturaCommonModule,
        KalturaPrimeNgUIModule,
        KalturaUIModule,
        KMCContentUIModule,
        MenuModule,
	    GrowlModule,
	    PopupWidgetModule,
        PrimeDynamicFormModule,
        MultiSelectModule,
        PaginatorModule,
        RadioButtonModule,
        ReactiveFormsModule,
        KalturaCustomMetadataModule,
        RouterModule.forChild([]),
        SpinnerModule,
        TooltipModule,
	    newToolTipModule
    ],
    declarations: [
        EntryAccessControl,
        EntryCaptions,
	    EntryCaptionsEdit,
        EntryClips,
        EntryComponent,
        EntryFlavours,
        EntryLive,
        EntryMetadata,
        EntryPreview,
        EntryRelated,
	    EntryRelatedEdit,
        EntryScheduling,
        EntrySectionsList,
        EntryThumbnails,
        EntryUsers
    ],
    exports: [
    ],
    providers: [
	    ConfirmationService
    ],
})
export class EntryModule { }
