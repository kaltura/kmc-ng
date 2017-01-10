import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule, ReactiveFormsModule }        from '@angular/forms';
import { KalturaUIModule } from '@kaltura-ng2/kaltura-ui';
import { KalturaPrimeNgUIModule } from '@kaltura-ng2/kaltura-primeng-ui';
import { TreeModule, TieredMenuModule, CheckboxModule, DataTableModule, SharedModule, InputTextModule, ButtonModule, AccordionModule, CalendarModule,  MultiSelectModule, PaginatorModule, MenuModule} from 'primeng/primeng';


import { AdditionalFiltersComponent } from './components/additional-filters.component';

import { routing} from './content-entries-app.routes';
import { EntriesComponent } from './components/entries.component';
import { FiltersAccordionComponent } from './components/filters.accordion.component';
import { KMCShellModule } from 'kmc-shell';
import { KMCContentUIModule } from 'kmc-content-ui';
import {SortDirectionPipe} from "./pipes/sort-direction.pipe";
import {FiltersComponent} from "./components/filters.component";
import {kEntriesTable} from './components/entries-table.component';

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
      ReactiveFormsModule,
      routing,
      SharedModule,
      TieredMenuModule,
      TreeModule
    ],
  declarations: [
      AdditionalFiltersComponent,
    EntriesComponent,
    FiltersAccordionComponent,
    FiltersComponent,
    kEntriesTable,
    SortDirectionPipe
  ],
  providers:    []
})
export class ContentEntriesAppModule { }
