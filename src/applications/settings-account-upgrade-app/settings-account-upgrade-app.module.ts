import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SettingsAccountUpgradeComponent} from './settings-account-upgrade.component';
import {routing} from './settings-account-upgrade-app.routes';
import {RouterModule} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {ButtonModule, InputTextareaModule, InputTextModule} from 'primeng/primeng';
import {AreaBlockerModule} from '@kaltura-ng/kaltura-ui';
import {TranslateModule} from 'ng2-translate';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routing),
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    AreaBlockerModule,
    TranslateModule,
    InputTextareaModule,
  ],
  declarations: [SettingsAccountUpgradeComponent]
})
export class SettingsAccountUpgradeAppModule {
}
