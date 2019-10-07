import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SettingsAccountInformationComponent} from './settings-account-information.component';
import {routing} from './settings-account-information-app.routes';
import {RouterModule} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {AreaBlockerModule, KalturaUIModule} from '@kaltura-ng/kaltura-ui';
import {TranslateModule} from '@ngx-translate/core';
import {AccountInfoComponent} from './account-info/account-info.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';

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
    KalturaUIModule
  ],
  declarations: [SettingsAccountInformationComponent, AccountInfoComponent]
})
export class SettingsAccountInformationAppModule {
}
