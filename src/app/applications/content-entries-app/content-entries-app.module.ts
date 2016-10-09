import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule, ReactiveFormsModule }        from '@angular/forms';

import { routing} from './content-entries-app.routes';
import { EntriesComponent } from './components/entries.component';
import { KMCngShellCommonModule } from 'kmcng-shell';
import { KMCSharedModule } from '../../kmc-shared/kmc-shared.module';
import { DropdownModule } from 'ng2-bootstrap/ng2-bootstrap';
import { DataTableModule, SharedModule, InputTextModule, ButtonModule, AccordionModule, PaginatorModule} from 'primeng/primeng';

@NgModule({
  imports:      [ CommonModule, FormsModule, routing, ReactiveFormsModule, KMCngShellCommonModule, DropdownModule, DataTableModule,
    SharedModule, InputTextModule, ButtonModule, AccordionModule, KMCSharedModule, PaginatorModule],
  declarations: [ EntriesComponent ],
  providers:    []
})
export class ContentEntriesAppModule { }
