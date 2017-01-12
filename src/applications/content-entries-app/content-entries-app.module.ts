import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule, ReactiveFormsModule }        from '@angular/forms';
import { KalturaUIModule } from '@kaltura-ng2/kaltura-ui';
import { PopupWidgetModule } from '@kaltura-ng2/kaltura-ui/popup-widget';
import { TagsModule } from '@kaltura-ng2/kaltura-ui/tags';
import { KalturaPrimeNgUIModule } from '@kaltura-ng2/kaltura-primeng-ui';
import { TreeModule, TieredMenuModule, CheckboxModule, DataTableModule, SharedModule, InputTextModule, ButtonModule, AccordionModule, CalendarModule,  MultiSelectModule, PaginatorModule, MenuModule} from 'primeng/primeng';


import { AdditionalFiltersComponent } from './components/additional-filters.component';

import { routing} from './content-entries-app.routes';
import { EntriesComponent } from './components/entries.component';
import { KMCShellModule } from 'kmc-shell';
import { KMCContentUIModule } from 'kmc-content-ui';
import {kEntriesTable} from './components/entries-table.component';
import {AdditionalFiltersStore} from "./providers/additional-filters-store.service";

@NgModule({
  imports:      [
      AccordionModule,
      ButtonModule,
      CalendarModule,
      CheckboxModule,
      CommonModule,
      DataTableModule,
      FormsModule,
      InputTextModule,
      KalturaPrimeNgUIModule,
      KalturaUIModule,
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
      AdditionalFiltersComponent,
    EntriesComponent,
    kEntriesTable
  ],
  providers:    [
      AdditionalFiltersStore
  ]
})
export class ContentEntriesAppModule { }
