import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {routing} from './settings-integration-settings-app.routes';
import {RouterModule} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {ButtonModule, DataTableModule, DropdownModule, InputTextModule, MenuModule} from 'primeng/primeng';
import {AreaBlockerModule, StickyModule, TooltipModule} from '@kaltura-ng/kaltura-ui';
import {TranslateModule} from 'ng2-translate';
import {SettingsIntegrationSettingsComponent} from './settings-integration-settings.component';
import {AccountInfoComponent} from './account-info/account-info.component';
import {EntitlementComponent} from './entitlement/entitlement.component';
import {EntitlementTableComponent} from './entitlement/entitlement-table/entitlement-table.component';
import {PopupWidgetModule} from '@kaltura-ng/kaltura-ui/popup-widget';
import {NewEntitlementComponent} from './entitlement/new-entitlement/new-entitlement.component';
import {EditEntitlementComponent} from './entitlement/edit-entitlement/edit-entitlement.component';
import {ContentSharedModule} from 'app-shared/content-shared/content-shared.module';

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
    DataTableModule,
    TooltipModule,
    MenuModule,
    PopupWidgetModule,
    StickyModule,
    ContentSharedModule
  ],
  declarations: [
    SettingsIntegrationSettingsComponent,
    AccountInfoComponent,
    EntitlementComponent,
    EntitlementTableComponent,
    NewEntitlementComponent,
    EditEntitlementComponent
  ]
})
export class SettingsIntegrationSettingsAppModule {
}
