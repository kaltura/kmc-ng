import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { KalturaUIModule } from '@kaltura-ng2/kaltura-ui';
import { PopupWidgetModule } from '@kaltura-ng2/kaltura-ui/popup-widget';
import { TagsModule } from '@kaltura-ng2/kaltura-ui/tags';
import { KalturaPrimeNgUIModule } from '@kaltura-ng2/kaltura-primeng-ui';
import { TreeModule, TieredMenuModule, CheckboxModule, DataTableModule, SharedModule, InputTextModule, ButtonModule, AccordionModule, CalendarModule,  MultiSelectModule, PaginatorModule, MenuModule, TooltipModule } from 'primeng/primeng';
import { KalturaCommonModule } from '@kaltura-ng2/kaltura-common';
import { KMCShellModule } from 'kmc-shell';

import { EntriesComponent } from './entries.component';

import { EntriesTableComponent } from './entries-table.component';
import { KMCContentUIModule } from "kmc-content-ui/kmc-content-ui.module";
import { EntriesListComponent } from "./entries-list.component";


@NgModule({
    imports:      [
        AccordionModule,
        ButtonModule,
        CalendarModule,
        CheckboxModule,
        CommonModule,
        DataTableModule,
        FormsModule,
        InputTextModule,
        KalturaCommonModule,
        KalturaPrimeNgUIModule,
        KalturaUIModule,
        KMCContentUIModule,
        KMCShellModule,
        MenuModule,
        MultiSelectModule,
        PaginatorModule,
        PopupWidgetModule,
        ReactiveFormsModule,
        RouterModule.forChild([]),
        SharedModule,
        TagsModule,
        TieredMenuModule,
        TooltipModule,
        TreeModule
    ],
    declarations: [
        EntriesComponent,
        EntriesListComponent,
        EntriesTableComponent
    ],
    exports: [
        EntriesComponent,
    ],
    providers:    [
    ]
})
export class EntriesModule { }
