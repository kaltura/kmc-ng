import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AreaBlockerModule, KalturaUIModule, TooltipModule} from '@kaltura-ng/kaltura-ui';
import {
  ButtonModule,
  CheckboxModule,
  DataTableModule,
  DropdownModule,
  InputSwitchModule,
  InputTextModule,
  MenuModule,
  SharedModule
} from 'primeng/primeng';
import {KalturaCommonModule} from '@kaltura-ng/kaltura-common';
import {KalturaPrimeNgUIModule} from '@kaltura-ng/kaltura-primeng-ui';
import {PopupWidgetModule} from '@kaltura-ng/kaltura-ui/popup-widget';

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

@NgModule({
  imports: [
    CommonModule,
    AreaBlockerModule,
    DataTableModule,
    KalturaCommonModule,
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
    CheckboxModule
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
    ManualLiveComponent
  ],
  exports: [
    UploadButtonComponent,
    UploadMonitorComponent
  ]
})
export class KmcUploadAppModule {
}
