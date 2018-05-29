import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routing } from './content-drop-folders-app.routes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AreaBlockerModule, KalturaUIModule, StickyModule, TooltipModule } from '@kaltura-ng/kaltura-ui';
import {
  ButtonModule,
  CalendarModule,
  CheckboxModule,
  DataTableModule,
  InputTextModule,
  MenuModule,
  PaginatorModule,
  SharedModule,
  TieredMenuModule,
  TreeModule
} from 'primeng/primeng';
import { TableModule } from 'primeng/table';
import {LocalizationModule} from '@kaltura-ng/mc-shared/localization';
import { KalturaPrimeNgUIModule } from '@kaltura-ng/kaltura-primeng-ui';
import { AutoCompleteModule } from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import { TagsModule } from '@kaltura-ng/kaltura-ui/tags';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui/popup-widget';
import { EntriesModule } from 'app-shared/content-shared/entries/entries.module';

import { ContentDropFoldersComponent } from './content-drop-folders.component';
import { DropFoldersComponentsList } from './drop-folders-components-list';
import { KMCShellModule } from 'app-shared/kmc-shell';
import { FiltersModule } from '@kaltura-ng/mc-shared/filters/filters.module';
import { KMCPermissionsModule } from 'app-shared/kmc-shared/kmc-permissions';

@NgModule({
  imports: [
    CommonModule,
    AreaBlockerModule,
    DataTableModule,
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
    KMCPermissionsModule
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
