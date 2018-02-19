import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsTranscodingSettingsComponent } from './settings-transcoding-settings.component';
import { routing } from './settings-transcoding-settings-app.routes';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule, DropdownModule, InputTextModule } from 'primeng/primeng';
import { AreaBlockerModule } from '@kaltura-ng/kaltura-ui';
import { TranslateModule } from 'ng2-translate';
import { TranscodingProfilesComponentsList } from './components-list';
import { TooltipModule } from '@kaltura-ng/kaltura-ui/tooltip/k-tooltip.module';
import { TableModule } from 'primeng/table';

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
    TableModule
  ],
  declarations: [
    SettingsTranscodingSettingsComponent,
    ...TranscodingProfilesComponentsList
  ]
})
export class SettingsTranscodingSettingsAppModule {
}
