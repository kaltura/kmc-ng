import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule, ReactiveFormsModule }        from '@angular/forms';

import { routing} from './kmc-app.routes';
import { EntriesComponent } from "./components/entries.component";
import { EntryTypePipe } from "../../shared/@kmc/pipes/entry.type.pipe";
import { EntryStatusPipe } from "../../shared/@kmc/pipes/entry.status.pipe";
import { TimePipe } from "../../shared/@kmc/pipes/time.pipe";

@NgModule({
  imports:      [ CommonModule, FormsModule, routing, ReactiveFormsModule ],
  declarations: [ EntriesComponent, EntryTypePipe, EntryStatusPipe, TimePipe ],
  providers:    []
})
export class KMCAppModule { }
