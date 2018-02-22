import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsTranscodingSettingsComponent } from './settings-transcoding-settings.component';
import { routing } from './settings-transcoding-settings-app.routes';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule, DataTableModule, DropdownModule, InputTextModule, PaginatorModule } from 'primeng/primeng';
import { AreaBlockerModule } from '@kaltura-ng/kaltura-ui';
import { TranslateModule } from 'ng2-translate';
import { TranscodingProfilesComponentsList } from './components-list';
import { TooltipModule } from '@kaltura-ng/kaltura-ui/tooltip/k-tooltip.module';
import { StickyModule } from '@kaltura-ng/kaltura-ui/sticky/sticky.module';
import { MenuModule } from 'primeng/menu';
import { KalturaUIModule } from '@kaltura-ng/kaltura-ui/kaltura-ui.module';
import { KalturaCommonModule } from '@kaltura-ng/kaltura-common/kaltura-common.module';
import { TranscodingProfileComponentsList } from './transcoding-profile/components-list';
import { DetailsBarModule } from '@kaltura-ng/kaltura-ui/details-bar/details-bar.module';
import { TranscodingProfileCanDeactivate } from './transcoding-profile/transcoding-profile-can-deactivate.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routing),
    ReactiveFormsModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
    AreaBlockerModule,
    TranslateModule,
    TooltipModule,
    DataTableModule,
    KalturaCommonModule,
    KalturaUIModule,
    PaginatorModule,
    StickyModule,
    MenuModule,
    DetailsBarModule
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
