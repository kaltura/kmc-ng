import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './settings-access-control-app.routes';
import { RouterModule } from '@angular/router';
import { SettingsAccessControlComponent } from './settings-access-control.component';
import { ProfilesComponentsList } from './profiles/profiles-components-list';
import {
  ButtonModule,
  CalendarModule,
  CheckboxModule,
  DataTableModule, InputSwitchModule,
  InputTextModule,
  MenuModule, MultiSelectModule,
  PaginatorModule, RadioButtonModule,
  SharedModule, SpinnerModule,
  TieredMenuModule,
  TreeModule
} from 'primeng/primeng';
import { AreaBlockerModule, KalturaUIModule, StickyModule, TooltipModule } from '@kaltura-ng/kaltura-ui';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TagsModule } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui';
import { FiltersModule } from '@kaltura-ng/mc-shared';
import { AutoCompleteModule } from '@kaltura-ng/kaltura-primeng-ui';
import { KalturaPrimeNgUIModule } from '@kaltura-ng/kaltura-primeng-ui';
import {LocalizationModule} from '@kaltura-ng/mc-shared';
import { TimeSpinnerModule } from '@kaltura-ng/kaltura-primeng-ui';
import { KMCPermissionsModule } from 'app-shared/kmc-shared/kmc-permissions';
import { TableModule } from 'primeng/table';
import { KPTableModule } from '@kaltura-ng/kaltura-primeng-ui';

@NgModule({
  imports: [
    CommonModule,
    AreaBlockerModule,
    DataTableModule,
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
    TagsModule,
    KalturaPrimeNgUIModule,
    AutoCompleteModule,
    SharedModule,
    RouterModule.forChild(routing),
    TreeModule,
    StickyModule,
    FiltersModule,
    RadioButtonModule,
    MultiSelectModule,
    SpinnerModule,
    InputSwitchModule,
    KMCPermissionsModule,
    TimeSpinnerModule,
      TableModule,
      KPTableModule
  ],
  declarations: [
    SettingsAccessControlComponent,
    ...ProfilesComponentsList
  ]
})
export class SettingsAccessControlAppModule {
}
