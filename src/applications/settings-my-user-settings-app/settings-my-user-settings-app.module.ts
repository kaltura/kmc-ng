import { NgModule} from '@angular/core';
import { CommonModule} from '@angular/common';
import { routing} from './settings-my-user-settings-app.routes';
import { RouterModule} from '@angular/router';
import { AreaBlockerModule, KalturaUIModule } from '@kaltura-ng/kaltura-ui';
import { SettingsMyUserSettingsComponent } from './settings-my-user-settings.component';
import { TranslateModule } from 'ng2-translate';


@NgModule({
  imports: [
    CommonModule,
    AreaBlockerModule,
    KalturaUIModule,
    TranslateModule,
    RouterModule.forChild(routing)
  ],
  declarations: [SettingsMyUserSettingsComponent]
})
export class SettingsMyUserSettingsAppModule {}
