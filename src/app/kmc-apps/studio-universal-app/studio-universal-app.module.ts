import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';

import { routing} from './studio-universal-app.routes';
import { StudioUniversalComponent } from "./components/studio-universal.component";
import {KMCTemporaryModule} from "../../shared/kmc-temporary.module";

@NgModule({
  imports: [
    CommonModule,
    KMCTemporaryModule,
    routing
  ],
  declarations: [
    StudioUniversalComponent
  ],
  providers: [ ]
})
export class StudioUniversalAppModule { }
