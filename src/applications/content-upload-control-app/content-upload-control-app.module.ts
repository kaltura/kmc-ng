import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './content-upload-control-app.routes';

import { AreaBlockerModule, StickyModule } from '@kaltura-ng/kaltura-ui';
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
import {LocalizationModule} from '@kaltura-ng/mc-shared';
import { KalturaPrimeNgUIModule } from '@kaltura-ng/kaltura-primeng-ui';
import {
  KalturaUIModule,
  TooltipModule
} from '@kaltura-ng/kaltura-ui';
import { AutoCompleteModule } from '@kaltura-ng/kaltura-primeng-ui';
import { TagsModule } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui';

import { ContentUploadControlComponent } from './content-upload-control.component';
import { UploadListComponent } from './upload-list/upload-list.component';
import { UploadListTableComponent } from './upload-list/upload-list-table.component';
import { UploadProgressComponent } from './upload-list/upload-progress/upload-progress.component';
import { KMCShellModule } from 'app-shared/kmc-shell';
import { UploadStatusPipe } from './upload-list/pipes/upload-status.pipe';

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
    KMCShellModule,
    StickyModule,
    RouterModule.forChild(routing)
  ],
  declarations: [
    ContentUploadControlComponent,
    UploadListComponent,
    UploadListTableComponent,
    UploadProgressComponent,
    UploadStatusPipe
  ],
  exports: [],
  providers: []
})
export class ContentUploadControlAppModule {
}
