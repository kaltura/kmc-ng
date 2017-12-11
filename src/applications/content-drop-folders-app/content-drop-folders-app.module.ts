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
import { KalturaCommonModule } from '@kaltura-ng/kaltura-common';
import { KalturaPrimeNgUIModule } from '@kaltura-ng/kaltura-primeng-ui';
import { AutoCompleteModule } from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import { TagsModule } from '@kaltura-ng/kaltura-ui/tags';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui/popup-widget';
import { ContentSharedModule } from 'app-shared/content-shared/content-shared.module';

import { ContentDropFoldersComponent } from './content-drop-folders.component';
import { DropFoldersComponentesList } from './drop-folders-list/drop-folders-components-list';
import { KMCShellModule } from 'app-shared/kmc-shell';

@NgModule({
  imports: [
    CommonModule,
    AreaBlockerModule,
    DataTableModule,
    KalturaCommonModule,
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
    ContentSharedModule,
    RouterModule.forChild(routing)
  ],
  declarations: [
    ContentDropFoldersComponent,
    DropFoldersComponentesList
  ],
  exports: [],
  providers: []
})
export class ContentDropFoldersAppModule {
}
