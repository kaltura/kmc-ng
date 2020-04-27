import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routing } from './content-drop-folders-app.routes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AreaBlockerModule, KalturaUIModule, StickyModule, TooltipModule } from '@kaltura-ng/kaltura-ui';
import { TableModule } from 'primeng/table';
import {LocalizationModule} from '@kaltura-ng/mc-shared';
import { KalturaPrimeNgUIModule } from '@kaltura-ng/kaltura-primeng-ui';
import { AutoCompleteModule } from '@kaltura-ng/kaltura-primeng-ui';
import { TagsModule } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui';
import { EntriesModule } from 'app-shared/content-shared/entries/entries.module';

import { ContentDropFoldersComponent } from './content-drop-folders.component';
import { DropFoldersComponentsList } from './drop-folders-components-list';
import { KMCShellModule } from 'app-shared/kmc-shell';
import { FiltersModule } from '@kaltura-ng/mc-shared';
import { KMCPermissionsModule } from 'app-shared/kmc-shared/kmc-permissions';
import { DateFormatModule } from 'app-shared/kmc-shared/date-format/date-format.module';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { MenuModule } from 'primeng/menu';
import { TreeModule } from 'primeng/tree';
import { SharedModule } from 'primeng/api/shared';

@NgModule({
  imports: [
    CommonModule,
    AreaBlockerModule,
    LocalizationModule,
    KalturaUIModule,
    PaginatorModule,
    TooltipModule,
    ButtonModule,
    TieredMenuModule,
    CheckboxModule,
    InputTextModule,
    PopupWidgetModule,
    CalendarModule,
    MenuModule,
    TagsModule,
    KalturaPrimeNgUIModule,
    AutoCompleteModule,
    TreeModule,
    SharedModule,
    KMCShellModule,
    FormsModule,
    ReactiveFormsModule,
    StickyModule,
      EntriesModule,
    RouterModule.forChild(routing),
    FiltersModule,
    TableModule,
    KMCPermissionsModule,
      DateFormatModule,
  ],
  declarations: [
    ContentDropFoldersComponent,
    DropFoldersComponentsList
  ],
  exports: [],
  providers: []
})
export class ContentDropFoldersAppModule {
}
