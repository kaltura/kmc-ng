import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ButtonModule, TooltipModule } from 'primeng/primeng';

import { KalturaCommonModule } from '@kaltura-ng2/kaltura-common';
import { KalturaUIModule } from '@kaltura-ng2/kaltura-ui';

import { KMCContentUIModule } from "../../../shared/kmc-content-ui/kmc-content-ui.module";


import { EntryMetadata } from "../entry-metadata/entry-metadata.component";
import { EntryUsers } from "../entry-users/entry-users.component";
import { EntrySectionsList } from "../entry-sections-list/entry-sections-list.component";
import { EntryComponent } from '../entry/entry.component';
import { PreviewComponent } from '../entry-preview/preview.component';

@NgModule({
    imports: [
        ButtonModule,
        CommonModule,
        FormsModule,
        KalturaCommonModule,
        KalturaUIModule,
        KMCContentUIModule,
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
