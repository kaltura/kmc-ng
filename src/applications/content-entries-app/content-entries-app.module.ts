import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule, ReactiveFormsModule }        from '@angular/forms';
import { KalturaUIModule } from '@kaltura-ng2/kaltura-ui';
import { PopupWidgetModule } from '@kaltura-ng2/kaltura-ui/popup-widget';
import { TagsModule } from '@kaltura-ng2/kaltura-ui/tags';
import { KalturaPrimeNgUIModule } from '@kaltura-ng2/kaltura-primeng-ui';
import { TreeModule, TieredMenuModule, CheckboxModule, DataTableModule, SharedModule, InputTextModule, ButtonModule, AccordionModule, CalendarModule, InputTextareaModule, MultiSelectModule, PaginatorModule, MenuModule, TooltipModule } from 'primeng/primeng';
import { KalturaCommonModule } from '@kaltura-ng2/kaltura-common';
import { AutoCompleteModule } from '@kaltura-ng2/kaltura-primeng-ui/auto-complete';


import { routing } from './content-entries-app.routes';
import { EntriesComponent } from './entries/entries.component';
import { KMCShellModule } from 'kmc-shell';
import { EntriesTableComponent } from './entries/entries-table.component';
import { EntryComponent } from './entry/entry.component';
import { PreviewComponent } from './entry-preview/preview.component';
import { KMCContentUIModule } from "../../shared/kmc-content-ui/kmc-content-ui.module";
import { EntryMetadata } from "./entry-metadata/entry-metadata.component";
import { EntryUsers } from "./entry-users/entry-users.component";
import { EntrySectionsList } from "./entry-sections-list/entry-sections-list.component";
import { EntriesListComponent } from "./entries/entries-list.component";

@NgModule({
  imports:      [
      AccordionModule,
      ButtonModule,
      CalendarModule,
      CheckboxModule,
      CommonModule,
	  TooltipModule,
      KalturaCommonModule,
      DataTableModule,
      FormsModule,
      InputTextModule,
	  InputTextareaModule,
      KalturaPrimeNgUIModule,
      KalturaUIModule,
	  AutoCompleteModule,
      KMCContentUIModule,
      KMCShellModule,
      MenuModule,
      MultiSelectModule,
      PaginatorModule,
      PopupWidgetModule,
      ReactiveFormsModule,
      routing,
      SharedModule,
      TieredMenuModule,
      TreeModule,
      TagsModule
    ],
  declarations: [
	  EntryComponent,
	  PreviewComponent,
      EntriesComponent,
      EntriesListComponent,
      EntriesTableComponent,
      EntryMetadata,
      EntrySectionsList,
      EntryUsers
  ],
  providers:    [
  ]
})
export class ContentEntriesAppModule { }
