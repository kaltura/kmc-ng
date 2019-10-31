import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsCustomDataComponent } from './settings-custom-data.component';
import { routing } from './settings-custom-data-app.routes';
import { RouterModule } from '@angular/router';
import { AreaBlockerModule, KalturaUIModule } from '@kaltura-ng/kaltura-ui';
import { SchemasComponents } from './schemas/schemas-components-list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EntriesModule } from 'app-shared/content-shared/entries/entries.module.ts';
import {LocalizationModule} from '@kaltura-ng/mc-shared';
import { TooltipModule } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui';
import { KalturaPrimeNgUIModule } from '@kaltura-ng/kaltura-primeng-ui';
import { StickyModule } from '@kaltura-ng/kaltura-ui';
import { KMCPermissionsModule } from 'app-shared/kmc-shared/kmc-permissions';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { MenuModule } from 'primeng/menu';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SharedModule } from 'primeng/shared';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';

@NgModule({
  imports: [
    CommonModule,
    AreaBlockerModule,
    LocalizationModule,
    KalturaUIModule,
    PaginatorModule,
    TooltipModule,
    ButtonModule,
    TieredMenuModule,
    CheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    PopupWidgetModule,
    CalendarModule,
    MenuModule,
    RadioButtonModule,
    KalturaPrimeNgUIModule,
    SharedModule,
    RouterModule.forChild(routing),
    StickyModule,
    EntriesModule,
    DropdownModule,
    InputSwitchModule,
    KMCPermissionsModule,
      TableModule
  ],
  declarations: [
    SettingsCustomDataComponent,
    SchemasComponents
  ]
})
export class SettingsCustomDataAppModule {
}
