import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { KMCngShellCommonModule } from '@kaltura/kmcng-shell';

import { routing} from './studio-universal-app.routes';
import { StudioUniversalComponent } from './components/studio-universal.component';

@NgModule({
  imports: [
    CommonModule,
    KMCngShellCommonModule,
    routing
  ],
  declarations: [
    StudioUniversalComponent
  ],
  providers: [ ]
})
export class StudioUniversalAppModule { }
