import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';

import { routing} from './dashboard-app.routes';
import { DashboardComponent } from "./components/dashboard.component";

@NgModule({
  imports:      [ CommonModule, routing ],
  declarations: [ DashboardComponent ],
  providers:    []
})
export class DashboardAppModule { }
