import { ModuleWithProviders, NgModule } from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AreaBlockerModule, KalturaUIModule, TooltipModule} from '@kaltura-ng/kaltura-ui';
import {LocalizationModule} from '@kaltura-ng/mc-shared';
import {KalturaPrimeNgUIModule} from '@kaltura-ng/kaltura-primeng-ui';
import {PopupWidgetModule} from '@kaltura-ng/kaltura-ui';

import {UploadMenuComponent} from './upload-menu/upload-menu.component';
import {UploadSettingsComponent} from './upload-settings/upload-settings.component';
import {UploadButtonComponent} from './upload-button/upload-button.component';
import {BulkUploadMenuComponent} from './bulk-upload-menu/bulk-upload-menu.component';
import {UploadMonitorComponent} from './upload-monitor/upload-monitor.component';
import {UploadMonitorSectionComponent} from './upload-monitor/upload-monitor-section/upload-monitor-section.component';
import {ManualLiveComponent} from './create-live/manual-live/manual-live.component';
import {UniversalLiveComponent} from './create-live/universal-live/universal-live.component';
import {TranscodingProfileSelectComponent} from './prepare-entry/transcoding-profile-select/transcoding-profile-select.component';
import {CreateLiveComponent} from './create-live/create-live.component';
import {KalturaLiveStreamComponent} from './create-live/kaltura-live-stream/kaltura-live-stream.component';
import {PrepareEntryComponent} from './prepare-entry/prepare-entry.component';
import { NewUploadMonitorService } from './upload-monitor/new-upload-monitor.service';
import { BulkUploadMonitorService } from './upload-monitor/bulk-upload-monitor.service';
import { DropFoldersMonitorService } from './upload-monitor/drop-folders-monitor.service';
import { KalturaLogger, KalturaLoggerName } from '@kaltura-ng/kaltura-logger';
import { KMCPermissionsModule } from 'app-shared/kmc-shared/kmc-permissions';
import { TableModule } from 'primeng/table';
import { UploadFromYoutubeComponent } from './upload-from-youtube/upload-from-youtube.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MenuModule } from 'primeng/menu';
import { SharedModule } from 'primeng/api/shared';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CheckboxModule } from 'primeng/checkbox';

@NgModule({
  imports: [
    CommonModule,
    AreaBlockerModule,
    LocalizationModule,
    KalturaUIModule,
    TooltipModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    PopupWidgetModule,
    MenuModule,
    KalturaPrimeNgUIModule,
    SharedModule,
    InputSwitchModule,
    CheckboxModule,
    KMCPermissionsModule,
      TableModule
  ],
  declarations: [
    UploadMenuComponent,
    UploadSettingsComponent,
    UploadButtonComponent,
    BulkUploadMenuComponent,
    UploadButtonComponent,
    UploadMonitorComponent,
    UploadMonitorSectionComponent,
    UploadButtonComponent,
    PrepareEntryComponent,
    TranscodingProfileSelectComponent,
    CreateLiveComponent,
    KalturaLiveStreamComponent,
    UniversalLiveComponent,
    ManualLiveComponent,
      UploadFromYoutubeComponent
  ],
  exports: [
    UploadButtonComponent,
    UploadMonitorComponent
  ]
})
export class KmcUploadAppModule {
  static forRoot(): ModuleWithProviders<KmcUploadAppModule> {
    return {
      ngModule: KmcUploadAppModule,
      providers: [
        KalturaLogger,
        {
          provide: KalturaLoggerName, useValue: 'upload-monitor'
        },
        BulkUploadMonitorService,
        NewUploadMonitorService,
        DropFoldersMonitorService
      ]
    };
  }
}
