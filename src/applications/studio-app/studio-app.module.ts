import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudioComponent } from './studio.component';
import { KalturaUIModule } from '@kaltura-ng/kaltura-ui';
import { routing } from './studio-app.routes';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routing),
    KalturaUIModule
  ],
  declarations: [
    StudioComponent
  ],
  exports: [],
  providers: [],
})
export class StudioAppModule {
}
