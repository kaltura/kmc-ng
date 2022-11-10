import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudioV2Component } from './studio-v2.component';
import { StudioV3Component } from './studio-v3.component';
import { StudioV7Component } from './studio-v7.component';
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
    StudioV2Component,
    StudioV3Component,
    StudioV7Component
  ],
  exports: [],
  providers: [],
})
export class StudioAppModule {
}
