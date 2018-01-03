import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsCustomDataComponent } from './settings-custom-data.component';
import { routing } from './settings-custom-data-app.routes';
import { RouterModule } from '@angular/router';
import { AreaBlockerModule, KalturaUIModule } from '@kaltura-ng/kaltura-ui';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routing)
  ],
  declarations: [SettingsCustomDataComponent]
})
export class SettingsCustomDataAppModule {
}
