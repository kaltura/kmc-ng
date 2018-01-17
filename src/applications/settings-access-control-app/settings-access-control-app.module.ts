import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './settings-access-control-app.routes';
import { RouterModule } from '@angular/router';
import { SettingsAccessControlComponent } from './settings-access-control.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routing),
  ],
  declarations: [SettingsAccessControlComponent]
})
export class SettingsAccessControlAppModule {
}
