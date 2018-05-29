import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DetailsBarModule} from '@kaltura-ng/kaltura-ui/details-bar';
import {TagsModule} from '@kaltura-ng/kaltura-ui/tags';
import {
    AccordionModule,
    ButtonModule,
    CalendarModule,
    CheckboxModule,
    ConfirmationService,
    ConfirmDialogModule,
    DataTableModule,
    DropdownModule,
    InputSwitchModule,
    InputTextareaModule,
    InputTextModule,
    MenuModule,
    MultiSelectModule,
    OverlayPanelModule,
    PaginatorModule,
    RadioButtonModule,
    SharedModule,
    SpinnerModule,
    TieredMenuModule,
    TreeModule
} from 'primeng/primeng';
import {KMCShellModule} from 'app-shared/kmc-shell';

import {routing} from './content-entries-app.routes';
import {ContentEntriesComponent} from './content-entries.component';

import {DynamicMetadataFormModule} from 'app-shared/kmc-shared';

import {LocalizationModule} from '@kaltura-ng/mc-shared/localization';
import {KalturaPrimeNgUIModule} from '@kaltura-ng/kaltura-primeng-ui';
import {AreaBlockerModule, KalturaUIModule, StickyModule, TooltipModule} from '@kaltura-ng/kaltura-ui';
import {AutoCompleteModule} from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import {PopupWidgetModule} from '@kaltura-ng/kaltura-ui/popup-widget';
import {DynamicFormModule} from '@kaltura-ng/kaltura-ui/dynamic-form';
import {DynamicFormModule as PrimeDynamicFormModule} from '@kaltura-ng/kaltura-primeng-ui/dynamic-form';
import {EntryComponentsList} from './entry/entry-components-list';
import {EntriesComponentsList} from './entries/entries-components-list';

import {EntryCanDeactivate} from './entry/entry-can-deactivate.service';
import {EntriesModule} from 'app-shared/content-shared/entries/entries.module';
import {ContentEntriesAppService} from './content-entries-app.service';
import {CategoriesModule} from 'app-shared/content-shared/categories/categories.module';
import {CopyToClipboardModule} from '@kaltura-ng/mc-shared/components/copy-to-clipboard';
import {KEditHosterModule} from 'app-shared/kmc-shared/kedit-hoster/kedit-hoster.module';
import { KMCPermissionsModule } from 'app-shared/kmc-shared/kmc-permissions';
import { TableModule } from 'primeng/table';
import { EntriesListService } from './entries/entries-list.service';

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
      CategoriesModule,
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
    DetailsBarModule,
      EntriesModule,
    StickyModule,
    CopyToClipboardModule,
    OverlayPanelModule,
    KEditHosterModule,
    StickyModule,
    KMCPermissionsModule,
    TableModule,
      InputSwitchModule
  ],
  declarations: [
    ContentEntriesComponent,
    EntryComponentsList,
    EntriesComponentsList,
  ],
  exports: [],
  providers: [
    ConfirmationService,
    EntryCanDeactivate,
    EntriesListService,
    ContentEntriesAppService
  ],
})
export class ContentEntriesAppModule {
}
