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
import { TagsModule } from '@kaltura-ng/kaltura-ui/tags';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui/popup-widget';
import { FiltersModule } from '@kaltura-ng/mc-shared/filters/filters.module';
import { AutoCompleteModule } from '@kaltura-ng/kaltura-primeng-ui/auto-complete/auto-complete.module';
import { KalturaPrimeNgUIModule } from '@kaltura-ng/kaltura-primeng-ui/kaltura-primeng-ui.module';
import {LocalizationModule} from '@kaltura-ng/mc-shared/localization';
import { TimeSpinnerModule } from '@kaltura-ng/kaltura-primeng-ui/time-spinner/time-spinner.module';
import { KMCPermissionsModule } from 'app-shared/kmc-shared/kmc-permissions';

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
    TimeSpinnerModule
  ],
  declarations: [
    SettingsAccessControlComponent,
    ...ProfilesComponentsList
  ]
})
export class SettingsAccessControlAppModule {
}
