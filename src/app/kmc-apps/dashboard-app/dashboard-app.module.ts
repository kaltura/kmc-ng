import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';

import { KalturaCoreModule } from '@kaltura-ng2/kaltura-core';

import { routing} from './dashboard-app.routes';
import { DashboardComponent } from "./components/dashboard.component";

@NgModule({
  imports:      [ CommonModule, routing, KalturaCoreModule ],
  declarations: [ DashboardComponent ],
  providers:    []
})
export class DashboardAppModule { }
