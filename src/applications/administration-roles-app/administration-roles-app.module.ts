import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TagsModule } from '@kaltura-ng/kaltura-ui/tags';
import {
  AccordionModule,
  ButtonModule,
  CalendarModule,
  CheckboxModule,
  ConfirmDialogModule,
  DataTableModule,
  DropdownModule, InputSwitchModule,
  InputTextareaModule,
  InputTextModule,
  MenuModule,
  PaginatorModule,
  RadioButtonModule,
  SharedModule,
  SpinnerModule,
  TieredMenuModule,
  TreeModule
} from 'primeng/primeng';
import { KMCShellModule } from 'app-shared/kmc-shell';

import { routing } from './administration-roles-app.routes';
import { AdministrationRolesComponent } from './administration-roles.component';

import { DynamicMetadataFormModule } from 'app-shared/kmc-shared';

import { KalturaCommonModule } from '@kaltura-ng/kaltura-common';
import { KalturaPrimeNgUIModule } from '@kaltura-ng/kaltura-primeng-ui';
import { AreaBlockerModule, KalturaUIModule, StickyModule, TooltipModule } from '@kaltura-ng/kaltura-ui';
import { AutoCompleteModule } from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui/popup-widget';
import { DynamicFormModule } from '@kaltura-ng/kaltura-ui/dynamic-form';
import { DynamicFormModule as PrimeDynamicFormModule } from '@kaltura-ng/kaltura-primeng-ui/dynamic-form';
import { EditRoleComponent } from './edit-role/edit-role.component';
import { PermissionsTableComponent } from './permissions-table/permissions-table.component';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from '@kaltura-ng/kaltura-primeng-ui/multi-select/multi-select.module';
import { RolesListComponent } from './roles-list/roles-list.component';
import { RolesTableComponent } from './roles-table/roles-table.component';
import { KMCPermissionsModule } from 'app-shared/kmc-shared/kmc-permissions';

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
    DataTableModule,
    DropdownModule,
    DynamicFormModule,
    FormsModule,
    InputTextareaModule,
    InputTextModule,
    KalturaCommonModule,
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
    KMCPermissionsModule
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
