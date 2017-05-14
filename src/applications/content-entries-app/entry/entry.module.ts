import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MultiSelectModule, ButtonModule, InputTextareaModule, PaginatorModule, InputTextModule, MenuModule, DataTableModule, DropdownModule, RadioButtonModule,
	CheckboxModule, CalendarModule, SpinnerModule, ConfirmDialogModule, ConfirmationService, GrowlModule } from 'primeng/primeng';

import { KalturaCommonModule } from '@kaltura-ng2/kaltura-common';
import { KalturaPrimeNgUIModule } from '@kaltura-ng2/kaltura-primeng-ui';
import { KalturaUIModule, TooltipModule } from '@kaltura-ng2/kaltura-ui';
import { AutoCompleteModule } from '@kaltura-ng2/kaltura-primeng-ui/auto-complete';
import { PopupWidgetModule } from '@kaltura-ng2/kaltura-ui/popup-widget';


import { EntryMetadata } from './entry-metadata/entry-metadata.component';
import { EntryThumbnails } from './entry-thumbnails/entry-thumbnails.component';
import { EntryAccessControl } from './entry-access-control/entry-access-control.component';
import { EntryScheduling } from './entry-scheduling/entry-scheduling.component';
import { EntryFlavours } from "./entry-flavours/entry-flavours.component";
import { DRMDetails } from './entry-flavours/drm-details/drm-details.component';
import { FlavorPreview } from './entry-flavours/flavor-preview/flavor-preview.component';
import { FlavorImport } from './entry-flavours/flavor-import/flavor-import.component';
import { EntryCaptions } from "./entry-captions/entry-captions.component";
import { EntryCaptionsEdit } from "./entry-captions/entry-captions-edit.component";
import { EntryLive } from "./entry-live/entry-live.component";
import { EntryRelated } from "./entry-related/entry-related.component";
import { EntryRelatedEdit } from "./entry-related/entry-related-edit.component";
import { EntryClips } from "./entry-clips/entry-clips.component";
import { EntryUsers } from "./entry-users/entry-users.component";
import { EntrySectionsList } from "./entry-sections-list/entry-sections-list.component";
import { EntryComponent } from './entry.component';
import { AreaBlockerModule } from '@kaltura-ng2/kaltura-ui';
import { EntryPreview } from './entry-preview/entry-preview.component';
import { DynamicFormModule } from '@kaltura-ng2/kaltura-ui/dynamic-form';
import { DynamicFormModule as PrimeDynamicFormModule } from '@kaltura-ng2/kaltura-primeng-ui/dynamic-form';
import { KalturaCustomMetadataModule } from '@kaltura-ng2/kaltura-ui/dynamic-form/kaltura-custom-metadata';
import { JumpToSection } from './entry-metadata/jump-to-section.component';
import { ContentEntriesAppSharedModule } from '../shared/content-entries-app-shared.module';

import { FileSizePipe } from './pipes/file-size.pipe';
import { ModerationPipe } from './pipes/moderation.pipe';

@NgModule({
    imports: [
        AreaBlockerModule,
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
        ContentEntriesAppSharedModule,
        MenuModule,
	    GrowlModule,
	    PopupWidgetModule,
        PrimeDynamicFormModule,
        MultiSelectModule,
        PaginatorModule,
        RadioButtonModule,
        ReactiveFormsModule,
	    TooltipModule,
        KalturaCustomMetadataModule,
        RouterModule.forChild([]),
        SpinnerModule
    ],
    declarations: [
	    EntryCaptionsEdit,
	    EntryRelatedEdit,
        EntryAccessControl,
        EntryCaptions,
        EntryClips,
        EntryComponent,
        EntryFlavours,
	    DRMDetails,
	    FlavorPreview,
	    FlavorImport,
        EntryLive,
        EntryMetadata,
        EntryPreview,
        EntryRelated,
        EntryScheduling,
        EntrySectionsList,
        EntryThumbnails,
        EntryUsers,
        ModerationPipe,
        FileSizePipe,
        JumpToSection
    ],
    exports: [
    ],
    providers: [
	    ConfirmationService
    ],
})
export class EntryModule { }
