import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule, ReactiveFormsModule }        from '@angular/forms';

import { routing} from './content-entries-app.routes';
import { EntriesComponent } from './components/entries.component';
import { EntryTypePipe } from './pipes/entry.type.pipe';
import { EntryStatusPipe } from './pipes/entry.status.pipe';
import { KMCngShellCommonModule } from '@kaltura/kmcng-shell';
import { DropdownModule } from 'ng2-bootstrap/ng2-bootstrap';

@NgModule({
  imports:      [ CommonModule, FormsModule, routing, ReactiveFormsModule, KMCngShellCommonModule, DropdownModule ],
  declarations: [ EntriesComponent, EntryTypePipe, EntryStatusPipe ],
  providers:    []
})
export class ContentEntriesAppModule { }
