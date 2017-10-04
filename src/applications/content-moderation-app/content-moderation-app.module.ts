import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routing } from './content-moderation-app.routes';

import { ContentModerationComponent } from './content-moderation.component';
import { EntriesComponentsList } from './entries/entries-components-list';
import { ContentSharedModule } from 'app-shared/content-shared/content-shared.module';

import { AreaBlockerModule } from '@kaltura-ng/kaltura-ui';
import {
	DataTableModule,
	PaginatorModule,
	ButtonModule,
	MenuModule,
	SharedModule,
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
  TreeModule
} from 'primeng/primeng';
import { KalturaCommonModule } from '@kaltura-ng/kaltura-common';
import { KalturaPrimeNgUIModule } from '@kaltura-ng/kaltura-primeng-ui';
import {
	KalturaUIModule,
  TooltipModule
} from '@kaltura-ng/kaltura-ui';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui/popup-widget';
import { AutoCompleteModule } from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import { DynamicFormModule } from '@kaltura-ng/kaltura-ui/dynamic-form';
import { DynamicFormModule as PrimeDynamicFormModule } from '@kaltura-ng/kaltura-primeng-ui/dynamic-form';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DynamicMetadataFormModule, MetadataProfileModule } from '@kaltura-ng/kaltura-server-utils';
import { KMCShellModule } from 'app-shared/kmc-shell';
import { PrimeTreeModule } from '@kaltura-ng/kaltura-primeng-ui/prime-tree';
import { TagsModule } from '@kaltura-ng/kaltura-ui/tags';

@NgModule({
    imports: [
      CommonModule,
      AreaBlockerModule,
      DataTableModule,
      KalturaCommonModule,
      KalturaUIModule,
      TooltipModule,
      PaginatorModule,
      ButtonModule,
      PopupWidgetModule,
      MenuModule,
      KalturaPrimeNgUIModule,
      SharedModule,
      ContentSharedModule,
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
      MetadataProfileModule,
      DynamicMetadataFormModule,
      KMCShellModule,
      PrimeDynamicFormModule,
      ReactiveFormsModule,
      PrimeTreeModule,
      TagsModule
    ],
    declarations: [
      ContentModerationComponent,
      EntriesComponentsList
    ],
    exports: [
    ],
    providers : []
})
export class ContentModerationAppModule {
}
