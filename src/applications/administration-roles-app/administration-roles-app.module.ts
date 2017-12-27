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
  DropdownModule,
  InputTextareaModule,
  InputTextModule,
  MenuModule,
  MultiSelectModule,
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

import { DynamicMetadataFormModule, MetadataProfileModule } from 'app-shared/kmc-shared';

import { KalturaCommonModule } from '@kaltura-ng/kaltura-common';
import { KalturaPrimeNgUIModule } from '@kaltura-ng/kaltura-primeng-ui';
import { PrimeTreeModule } from '@kaltura-ng/kaltura-primeng-ui/prime-tree';
import { AreaBlockerModule, KalturaUIModule, StickyModule, TooltipModule } from '@kaltura-ng/kaltura-ui';
import { AutoCompleteModule } from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui/popup-widget';
import { DynamicFormModule } from '@kaltura-ng/kaltura-ui/dynamic-form';
import { DynamicFormModule as PrimeDynamicFormModule } from '@kaltura-ng/kaltura-primeng-ui/dynamic-form';
import { RolesComponentsList } from './roles/roles-components-list';
import { EditRoleComponent } from './role/edit-role/edit-role.component';

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
    MetadataProfileModule,
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
    PrimeTreeModule,
    SpinnerModule,
    TagsModule,
    TieredMenuModule,
    TooltipModule,
    TreeModule,
    StickyModule
  ],
  declarations: [
    AdministrationRolesComponent,
    RolesComponentsList,
    EditRoleComponent
  ],
  exports: [],
  providers: [],
})
export class AdministrationRolesAppModule {
}
