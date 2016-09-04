import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule, ReactiveFormsModule }        from '@angular/forms';
import { DropdownModule } from 'ng2-bootstrap/ng2-bootstrap';

import { routing} from './content-entries-app.routes';
import { EntriesComponent } from './components/entries.component';
import { EntryTypePipe } from './pipes/entry.type.pipe';
import { EntryStatusPipe } from './pipes/entry.status.pipe';
import { TimePipe } from './pipes/time.pipe';

@NgModule({
  imports:      [ CommonModule, FormsModule, routing, ReactiveFormsModule, DropdownModule ],
  declarations: [ EntriesComponent, EntryTypePipe, EntryStatusPipe, TimePipe ],
  providers:    []
})
export class ContentEntriesAppModule { }
