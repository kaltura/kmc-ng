import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AreaBlockerModule, PopupWidgetModule } from '@kaltura-ng/kaltura-ui';
import { KalturaPrimeNgUIModule } from '@kaltura-ng/kaltura-primeng-ui';
import { AutoCompleteModule } from '@kaltura-ng/kaltura-primeng-ui';
import { LocalizationModule } from '@kaltura-ng/mc-shared';
import { KMCPermissionsModule } from 'app-shared/kmc-shared/kmc-permissions';
import { EntriesModule } from 'app-shared/content-shared/entries/entries.module';
import { CategoriesModule } from 'app-shared/content-shared/categories/categories.module';

import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TieredMenuModule } from 'primeng/tieredmenu';

import { BulkActionsComponent } from './bulk-actions.component';
import { CategoriesSelector } from '../../entry/entry-metadata/category-selector/categories-selector.component';
import {
    BulkScheduling,
    BulkAAccessControl,
    BulkAddTags,
    BulkAddPublishersComponent,
    BulkRemovePublishersComponent,
    BulkAddEditorsComponent,
    BulkRemoveEditorsComponent,
    BulkRemoveTags,
    BulkChangeOwner,
    BulkRemoveCategories,
    BulkDownload,
    BulkAddViewersComponent,
    BulkRemoveViewersComponent,
} from './components';

const BULK_ACTIONS_COMPONENTS = [
    BulkActionsComponent,
    CategoriesSelector,
    BulkScheduling,
    BulkAAccessControl,
    BulkAddTags,
    BulkAddPublishersComponent,
    BulkRemovePublishersComponent,
    BulkAddEditorsComponent,
    BulkRemoveEditorsComponent,
    BulkRemoveTags,
    BulkChangeOwner,
    BulkRemoveCategories,
    BulkDownload,
    BulkAddViewersComponent,
    BulkRemoveViewersComponent,
];

@NgModule({
    imports: [
        AreaBlockerModule,
        AutoCompleteModule,
        ButtonModule,
        CalendarModule,
        CategoriesModule,
        CheckboxModule,
        CommonModule,
        DropdownModule,
        EntriesModule,
        FormsModule,
        KalturaPrimeNgUIModule,
        KMCPermissionsModule,
        LocalizationModule,
        PopupWidgetModule,
        RadioButtonModule,
        ReactiveFormsModule,
        TieredMenuModule,
    ],
    declarations: BULK_ACTIONS_COMPONENTS,
    exports: BULK_ACTIONS_COMPONENTS,
})
export class BulkActionsModule {}
