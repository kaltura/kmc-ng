import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './settings-access-control-app.routes';
import { RouterModule } from '@angular/router';
import { SettingsAccessControlComponent } from './settings-access-control.component';
import { ProfilesComponentsList } from './profiles/profiles-components-list';
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
import { DateFormatModule } from 'app-shared/kmc-shared/date-format/date-format.module';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { CalendarModule } from 'primeng/calendar';
import { SharedModule } from 'primeng/api/shared';
import { TreeModule } from 'primeng/tree';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MultiSelectModule } from 'primeng/multiselect';
import { SpinnerModule } from 'primeng/spinner';
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
      KPTableModule,
      DateFormatModule,
  ],
  declarations: [
    SettingsAccessControlComponent,
    ...ProfilesComponentsList
  ]
})
export class SettingsAccessControlAppModule {
}
