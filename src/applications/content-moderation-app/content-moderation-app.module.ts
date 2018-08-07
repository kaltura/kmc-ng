import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routing } from './content-moderation-app.routes';

import { ContentModerationComponent } from './content-moderation.component';
import { EntriesComponentsList } from './entries-components-list';
import { EntriesModule } from 'app-shared/content-shared/entries/entries.module';

import { AreaBlockerModule, KalturaUIModule, TooltipModule } from '@kaltura-ng/kaltura-ui';
import {
  AccordionModule,
  ButtonModule,
  CalendarModule,
  CheckboxModule,
  ConfirmDialogModule,
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
import {LocalizationModule} from '@kaltura-ng/mc-shared';
import { KalturaPrimeNgUIModule } from '@kaltura-ng/kaltura-primeng-ui';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui';
import { AutoCompleteModule } from '@kaltura-ng/kaltura-primeng-ui';
import { DynamicFormModule } from '@kaltura-ng/kaltura-ui';
import { DynamicFormModule as PrimeDynamicFormModule } from '@kaltura-ng/kaltura-primeng-ui';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KMCShellModule } from 'app-shared/kmc-shell';
import { TagsModule } from '@kaltura-ng/kaltura-ui';
import { DynamicMetadataFormModule } from 'app-shared/kmc-shared';
import { KMCPermissionsModule } from 'app-shared/kmc-shared/kmc-permissions';

@NgModule({
  imports: [
    CommonModule,
    AreaBlockerModule,
    LocalizationModule,
    KalturaUIModule,
    TooltipModule,
    PaginatorModule,
    ButtonModule,
    PopupWidgetModule,
    MenuModule,
    KalturaPrimeNgUIModule,
    SharedModule,
      EntriesModule,
    AccordionModule,
    CalendarModule,
    CheckboxModule,
    ConfirmDialogModule,
    DropdownModule,
    InputTextareaModule,
    InputTextModule,
    MultiSelectModule,
    RadioButtonModule,
    SpinnerModule,
    TieredMenuModule,
    TreeModule,
    RouterModule.forChild(routing),
    AutoCompleteModule,
    DynamicFormModule,
    FormsModule,
    DynamicMetadataFormModule,
    KMCShellModule,
    PrimeDynamicFormModule,
    ReactiveFormsModule,
    TagsModule,
    KMCPermissionsModule
  ],
  declarations: [
    ContentModerationComponent,
    EntriesComponentsList
  ],
  exports: [],
  providers: []
})
export class ContentModerationAppModule {
}
