import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './content-upload-control-app.routes';

import { AreaBlockerModule } from '@kaltura-ng/kaltura-ui';
import {
  DataTableModule,
  PaginatorModule,
  ButtonModule,
  TieredMenuModule,
  CheckboxModule,
  InputTextModule,
  CalendarModule,
  MenuModule,
  SharedModule,
  ProgressBarModule,
} from 'primeng/primeng';
import { KalturaCommonModule } from '@kaltura-ng/kaltura-common';
import { KalturaPrimeNgUIModule } from '@kaltura-ng/kaltura-primeng-ui';
import {
  KalturaUIModule,
  TooltipModule
} from '@kaltura-ng/kaltura-ui';
import { AutoCompleteModule } from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import { TagsModule } from '@kaltura-ng/kaltura-ui/tags';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui/popup-widget';

import { ContentUploadControlComponent } from './content-upload-control.component';
import { UploadListComponent } from './upload-list/upload-list.component';
import { UploadListTableComponent } from './upload-list/upload-list-table.component';
import { EntryTypePipe } from './pipes/entry-type.pipe';
import { UploadProgressComponent } from './upload-list/upload-progress/upload-progress.component';


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
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    PopupWidgetModule,
    CalendarModule,
    MenuModule,
    TagsModule,
    KalturaPrimeNgUIModule,
    AutoCompleteModule,
    SharedModule,
    ProgressBarModule,
    RouterModule.forChild(routing)
  ],
  declarations: [
    ContentUploadControlComponent,
    UploadListComponent,
    UploadListTableComponent,
    EntryTypePipe,
    UploadProgressComponent
  ],
  exports: [],
  providers: []
})
export class ContentUploadControlAppModule {
}
