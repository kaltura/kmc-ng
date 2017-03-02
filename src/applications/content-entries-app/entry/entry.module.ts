import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ButtonModule, TooltipModule, InputTextareaModule, InputTextModule, MenuModule } from 'primeng/primeng';

import { KalturaCommonModule } from '@kaltura-ng2/kaltura-common';
import { KalturaUIModule } from '@kaltura-ng2/kaltura-ui';
import { AutoCompleteModule } from '@kaltura-ng2/kaltura-primeng-ui/auto-complete';

import { KMCContentUIModule } from "kmc-content-ui/kmc-content-ui.module";

import { EntryMetadata } from "./entry-metadata/entry-metadata.component";
import { EntryThumbnails } from "./entry-thumbnails/entry-thumbnails.component";
import { EntryAccessControl } from "./entry-access-control/entry-access-control.component";
import { EntryScheduling } from "./entry-scheduling/entry-scheduling.component";
import { EntryFlavours } from "./entry-flavours/entry-flavours.component";
import { EntryCaptions } from "./entry-captions/entry-captions.component";
import { EntryLive } from "./entry-live/entry-live.component";
import { EntryRelated } from "./entry-related/entry-related.component";
import { EntryClips } from "./entry-clips/entry-clips.component";
import { EntryUsers } from "./entry-users/entry-users.component";
import { EntrySectionsList } from "./entry-sections-list/entry-sections-list.component";
import { EntryComponent } from './entry.component';
import { EntryPreview } from './entry-preview/entry-preview.component';
import { EntrySectionHandler } from '../entry-store/entry-section-handler';
import { EntrySectionsListHandler } from './entry-sections-list/entry-sections-list-handler';
import { EntryMetadataHandler } from './entry-metadata/entry-metadata-handler';
import { EntryPreviewHandler } from './entry-preview/entry-preview-handler';
import { EntryCaptionsHandler } from './entry-captions/entry-captions-handler';
import { EntryAccessControlHandler } from './entry-access-control/entry-access-control-handler';
import { EntryClipsHandler } from './entry-clips/entry-clips-handler';
import { EntryRelatedHandler } from './entry-related/entry-related-handler';
import { EntryLiveHandler } from './entry-live/entry-live-handler';
import { EntryFlavoursHandler } from './entry-flavours/entry-flavours-handler';
import { EntryThumbnailsHandler } from './entry-thumbnails/entry-thumbnails-handler';
import { EntrySchedulingHandler } from './entry-scheduling/entry-scheduling-handler';
import { EntryUsersHandler } from './entry-users/entry-users-handler';

@NgModule({
    imports: [
        AutoCompleteModule,
        ButtonModule,
        CommonModule,
        FormsModule,
        InputTextModule,
        InputTextareaModule,
        KalturaCommonModule,
        KalturaUIModule,
        KMCContentUIModule,
        MenuModule,
        ReactiveFormsModule,
        RouterModule.forChild([]),
        TooltipModule
    ],
    declarations: [
        EntryComponent,
        EntryMetadata,
	    EntryThumbnails,
	    EntryAccessControl,
	    EntryScheduling,
	    EntryFlavours,
	    EntryCaptions,
	    EntryLive,
	    EntryRelated,
	    EntryClips,
        EntrySectionsList,
        EntryUsers,
        EntryPreview
    ],
    exports: [
    ],
    providers: [
        EntrySectionsListHandler,
        EntryPreviewHandler,
        EntryMetadataHandler,
        EntryAccessControlHandler,
        EntryCaptionsHandler,
        EntryClipsHandler,
        EntryFlavoursHandler,
        EntryLiveHandler,
        EntryRelatedHandler,
        EntrySchedulingHandler,
        EntryThumbnailsHandler,
        EntryUsersHandler,
        {provide : EntrySectionHandler, useExisting : EntrySectionsListHandler, multi:true},
        {provide : EntrySectionHandler, useExisting : EntryPreviewHandler, multi:true},
        {provide : EntrySectionHandler, useExisting : EntryMetadataHandler, multi:true},
        {provide : EntrySectionHandler, useExisting : EntryAccessControlHandler, multi:true},
        {provide : EntrySectionHandler, useExisting : EntryCaptionsHandler, multi:true},
        {provide : EntrySectionHandler, useExisting : EntryClipsHandler, multi:true},
        {provide : EntrySectionHandler, useExisting : EntryFlavoursHandler, multi:true},
        {provide : EntrySectionHandler, useExisting : EntryLiveHandler, multi:true},
        {provide : EntrySectionHandler, useExisting : EntryRelatedHandler, multi:true},
        {provide : EntrySectionHandler, useExisting : EntrySchedulingHandler, multi:true},
        {provide : EntrySectionHandler, useExisting : EntryThumbnailsHandler, multi:true},
        {provide : EntrySectionHandler, useExisting : EntryUsersHandler, multi:true}
    ],
})
export class EntryModule { }
