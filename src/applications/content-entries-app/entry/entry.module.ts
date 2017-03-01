import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ButtonModule, TooltipModule, InputTextareaModule, InputTextModule, MenuModule } from 'primeng/primeng';

import { KalturaCommonModule } from '@kaltura-ng2/kaltura-common';
import { KalturaUIModule } from '@kaltura-ng2/kaltura-ui';
import { AutoCompleteModule } from '@kaltura-ng2/kaltura-primeng-ui/auto-complete';

import { KMCContentUIModule } from "../../../shared/kmc-content-ui/kmc-content-ui.module";

import { EntryMetadata } from "./entry-metadata/entry-metadata.component";
import { EntryUsers } from "./entry-users/entry-users.component";
import { EntrySectionsList } from "./entry-sections-list/entry-sections-list.component";
import { EntryComponent } from './entry.component';
import { PreviewComponent } from './entry-preview/preview.component';

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
        EntrySectionsList,
        EntryUsers,
        PreviewComponent
    ],
    exports: [
        EntryComponent,
        EntryMetadata,
        EntryUsers
    ],
    providers: [],
})
export class EntryModule { }
