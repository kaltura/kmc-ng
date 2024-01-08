import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DetailsBarModule } from '@kaltura-ng/kaltura-ui';

import { routing } from './content-documents-app.routes';

import { AreaBlockerModule, KalturaUIModule, StickyModule, TooltipModule } from '@kaltura-ng/kaltura-ui';
import { TableModule } from 'primeng/table';
import { LocalizationModule } from '@kaltura-ng/mc-shared';
import { KalturaPrimeNgUIModule } from '@kaltura-ng/kaltura-primeng-ui';
import { AutoCompleteModule } from '@kaltura-ng/kaltura-primeng-ui';
import { TagsModule } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui';
import { DynamicFormModule } from '@kaltura-ng/kaltura-ui';
import { DynamicFormModule as PrimeDynamicFormModule } from '@kaltura-ng/kaltura-primeng-ui';
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
import { DocumentsListComponent } from './documents/documents-list/documents-list.component';
import { DocumentsTagsComponent } from './documents/documents-tags/documents-tags.component';
import { CategoriesModule } from 'app-shared/content-shared/categories/categories.module';
import { DocumentsTableComponent } from './documents/documents-table/documents-table.component';
import { ContentDocumentsAppService } from './content-documents-app.service';
import { DocumentsRefineFiltersComponent } from './documents/documents-refine-filters/documents-refine-filters.component';
import { DocumentComponent } from './document/document.component';
import { DocumentCanDeactivate } from './document/document-can-deactivate.service';
import { DocumentDetailsComponent } from './document/document-details/document-details.component';
import { DocumentSectionsList } from './document/document-sections-list/document-sections-list.component';
import { JumpToSection } from './document/document-metadata/jump-to-section.component';
import { CategoriesSelector } from './document/document-metadata/category-selector/categories-selector.component';
import { DocumentMetadataComponent } from './document/document-metadata/document-metadata.component';
import { DynamicMetadataFormModule } from 'app-shared/kmc-shared';
import { DocumentThumbnails } from './document/document-thumbnails/document-thumbnails.component';
import { DocumentAccessControl } from './document/document-access-control/document-access-control.component';
import { DocumentScheduling } from './document/document-scheduling/document-scheduling.component';
import { DocumentRelatedEdit } from './document/document-related/document-related-edit.component';
import { DocumentRelated } from './document/document-related/document-related.component';
import { DocumentUsers } from './document/document-users/document-users.component';

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
      DynamicFormModule,
      PrimeDynamicFormModule,
      SliderModule,
      TableModule,
      KMCPermissionsModule,
      KPTableModule,
      DateFormatModule,
      DynamicMetadataFormModule,
      CategoriesModule
    ],
    declarations: [
      ContentDocumentsComponent,
      DocumentsListComponent,
      DocumentsTagsComponent,
      DocumentsTableComponent,
      DocumentsRefineFiltersComponent,
      DocumentComponent,
      DocumentDetailsComponent,
      DocumentSectionsList,
      CategoriesSelector,
      JumpToSection,
      DocumentMetadataComponent,
      DocumentThumbnails,
      DocumentAccessControl,
      DocumentScheduling,
      DocumentRelatedEdit,
      DocumentRelated,
      DocumentUsers
    ],
    exports: [
    ],
    providers : [
      DocumentCanDeactivate,
      ContentDocumentsAppService
    ]
})
export class ContentDocumentsAppModule {
}
