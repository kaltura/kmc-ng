import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsTranscodingSettingsComponent } from './settings-transcoding-settings.component';
import { routing } from './settings-transcoding-settings-app.routes';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule, DropdownModule, InputTextModule, InputTextareaModule, PaginatorModule } from 'primeng/primeng';
import { AreaBlockerModule } from '@kaltura-ng/kaltura-ui';
import { TranslateModule } from '@ngx-translate/core';
import { TranscodingProfilesComponentsList } from './transcoding-profiles/components-list';
import { KalturaUIModule, TooltipModule, StickyModule } from '@kaltura-ng/kaltura-ui';
import { MenuModule } from 'primeng/menu';
import {LocalizationModule} from '@kaltura-ng/mc-shared';
import { TranscodingProfileComponentsList } from './transcoding-profile/components-list';
import { DetailsBarModule } from '@kaltura-ng/kaltura-ui';
import { TranscodingProfileCanDeactivate } from './transcoding-profile/transcoding-profile-can-deactivate.service';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui';
import { KMCPermissionsModule } from 'app-shared/kmc-shared/kmc-permissions';
import { TableModule } from 'primeng/table';
import { DateFormatModule } from 'app-shared/kmc-shared/date-format/date-format.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routing),
    ReactiveFormsModule,
    DropdownModule,
    InputTextModule,
    InputTextareaModule,
    ButtonModule,
    AreaBlockerModule,
    TranslateModule,
    TooltipModule,
    LocalizationModule,
    KalturaUIModule,
    PaginatorModule,
    StickyModule,
    MenuModule,
    DetailsBarModule,
    TooltipModule,
    PopupWidgetModule,
    DropdownModule,
    KMCPermissionsModule,
      TableModule,
      DateFormatModule,
  ],
  declarations: [
    SettingsTranscodingSettingsComponent,
    ...TranscodingProfilesComponentsList,
    ...TranscodingProfileComponentsList
  ],
  providers: [
    TranscodingProfileCanDeactivate
  ]
})
export class SettingsTranscodingSettingsAppModule {
}
