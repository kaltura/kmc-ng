import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TagsModule } from '@kaltura-ng/kaltura-ui';
import { KMCShellModule } from 'app-shared/kmc-shell';

import { routing } from './administration-roles-app.routes';
import { AdministrationRolesComponent } from './administration-roles.component';

import { DynamicMetadataFormModule } from 'app-shared/kmc-shared';

import {LocalizationModule} from '@kaltura-ng/mc-shared';
import { KalturaPrimeNgUIModule } from '@kaltura-ng/kaltura-primeng-ui';
import { AreaBlockerModule, KalturaUIModule, StickyModule, TooltipModule } from '@kaltura-ng/kaltura-ui';
import { AutoCompleteModule } from '@kaltura-ng/kaltura-primeng-ui';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui';
import { DynamicFormModule } from '@kaltura-ng/kaltura-ui';
import { DynamicFormModule as PrimeDynamicFormModule } from '@kaltura-ng/kaltura-primeng-ui';
import { EditRoleComponent } from './edit-role/edit-role.component';
import { PermissionsTableComponent } from './permissions-table/permissions-table.component';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from '@kaltura-ng/kaltura-primeng-ui';
import { RolesListComponent } from './roles-list/roles-list.component';
import { RolesTableComponent } from './roles-table/roles-table.component';
import { KMCPermissionsModule } from 'app-shared/kmc-shared/kmc-permissions';
import { DateFormatModule } from 'app-shared/kmc-shared/date-format/date-format.module';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { PaginatorModule } from 'primeng/paginator';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SharedModule } from 'primeng/api/shared';
import { SpinnerModule } from 'primeng/spinner';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { TreeModule } from 'primeng/tree';
import { InputSwitchModule } from 'primeng/inputswitch';

@NgModule({
  imports: [
    AccordionModule,
    AreaBlockerModule,
    AutoCompleteModule,
    ButtonModule,
    CalendarModule,
    CheckboxModule,
    CommonModule,
    ConfirmDialogModule,
    DropdownModule,
    DynamicFormModule,
    FormsModule,
    InputTextareaModule,
    InputTextModule,
    LocalizationModule,
    DynamicMetadataFormModule,
    KalturaPrimeNgUIModule,
    KalturaUIModule,
    KMCShellModule,
    MenuModule,
    MultiSelectModule,
    PaginatorModule,
    PopupWidgetModule,
    PrimeDynamicFormModule,
    RadioButtonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routing),
    SharedModule,
    SpinnerModule,
    TagsModule,
    TieredMenuModule,
    TooltipModule,
    TreeModule,
    StickyModule,
    KMCPermissionsModule,
    TableModule,
    InputSwitchModule,
      DateFormatModule,
  ],
  declarations: [
    AdministrationRolesComponent,
    EditRoleComponent,
    PermissionsTableComponent,
    RolesListComponent,
    RolesTableComponent
  ],
  exports: [],
  providers: [],
})
export class AdministrationRolesAppModule {
}
