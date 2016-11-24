import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule, ReactiveFormsModule }        from '@angular/forms';
import { KalturaUIModule } from '@kaltura-ng2/kaltura-ui';
import { DropdownModule } from 'ng2-bootstrap/ng2-bootstrap';
import { MenuModule, TieredMenuModule, CheckboxModule, DataTableModule, SharedModule, InputTextModule, ButtonModule, AccordionModule, CalendarModule,  MultiSelectModule, PaginatorModule} from 'primeng/primeng';

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
    TieredMenuModule,
    CheckboxModule,
    CommonModule,
    FormsModule,
    CalendarModule,
    routing,
    ReactiveFormsModule,
    KMCShellModule,
    DropdownModule,
    DataTableModule,
    SharedModule,
    InputTextModule,
    ButtonModule,
    AccordionModule,
    KMCContentUIModule,
    PaginatorModule,
    MultiSelectModule,
    KalturaUIModule],
  declarations: [
    EntriesComponent,
    FiltersComponent,
    SortDirectionPipe,
    FiltersAccordionComponent,
    kEntriesTable],
  providers:    []
})
export class ContentEntriesAppModule { }
