import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';

import { routing} from './studio-universal-app.routes';
import { StudioUniversalComponent } from "./components/studio-universal.component";

@NgModule({
  imports:      [ CommonModule, routing ],
  declarations: [ StudioUniversalComponent ],
  providers:    [ ]
})
export class StudioUniversalAppModule { }
