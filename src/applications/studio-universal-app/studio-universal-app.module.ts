import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { KMCShellModule } from 'kmc-shell';

import { routing} from './studio-universal-app.routes';
import { StudioUniversalComponent } from './components/studio-universal.component';

@NgModule({
  imports: [
    CommonModule,
    KMCShellModule,
    routing
  ],
  declarations: [
    StudioUniversalComponent
  ],
  providers: [ ]
})
export class StudioUniversalAppModule { }
