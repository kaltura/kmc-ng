import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DetailsBarModule } from '@kaltura-ng/kaltura-ui';

import { routing } from './content-documents-app.routes';

import { AreaBlockerModule, KalturaUIModule, StickyModule, TooltipModule } from '@kaltura-ng/kaltura-ui';
import { TableModule } from 'primeng/table';
import {LocalizationModule} from '@kaltura-ng/mc-shared';
import { KalturaPrimeNgUIModule } from '@kaltura-ng/kaltura-primeng-ui';
import { AutoCompleteModule } from '@kaltura-ng/kaltura-primeng-ui';
import { TagsModule } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui';

import { ContentDocumentsComponent } from './content-documents.component';
import { EntriesModule } from 'app-shared/content-shared/entries/entries.module';
import { FiltersModule } from '@kaltura-ng/mc-shared';
import { SliderModule } from '@kaltura-ng/kaltura-primeng-ui';
import { KMCPermissionsModule } from 'app-shared/kmc-shared/kmc-permissions';
import { KPTableModule } from '@kaltura-ng/kaltura-primeng-ui';
import { DateFormatModule } from 'app-shared/kmc-shared/date-format/date-format.module';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { MenuModule } from 'primeng/menu';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SharedModule } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { DocumentsListComponent } from "./documents/documents-list/documents-list.component";
import { DocumentsTagsComponent } from "./documents/documents-tags/documents-tags.component";
import { CategoriesModule } from "app-shared/content-shared/categories/categories.module";
import { DocumentsTableComponent } from "./documents/documents-table/documents-table.component";
import {ContentDocumentsAppService} from "./content-documents-app.service";
import {DocumentsRefineFiltersComponent} from "./documents/documents-refine-filters/documents-refine-filters.component";

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
      InputTextareaModule,
      PopupWidgetModule,
      CalendarModule,
      MenuModule,
      RadioButtonModule,
      TagsModule,
      KalturaPrimeNgUIModule,
      AutoCompleteModule,
      SharedModule,
	  DetailsBarModule,
      RouterModule.forChild(routing),
	  StickyModule,
        EntriesModule,
    FiltersModule,
    DropdownModule,
    SliderModule,
      TableModule,
      KMCPermissionsModule,
        KPTableModule,
        DateFormatModule,
        CategoriesModule
  ],declarations: [
      ContentDocumentsComponent,
        DocumentsListComponent,
        DocumentsTagsComponent,
        DocumentsTableComponent,
        DocumentsRefineFiltersComponent
    ],
    exports: [
    ],
    providers : [
      ContentDocumentsAppService
    ]
})
export class ContentDocumentsAppModule {
}
