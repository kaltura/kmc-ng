import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';

import { KalturaCommonModule } from '@kaltura-ng2/kaltura-common';

import { routing} from './dashboard-app.routes';
import { DashboardComponent } from "./components/dashboard.component";

@NgModule({
  imports:      [ CommonModule, routing, KalturaCommonModule ],
  declarations: [ DashboardComponent ],
  providers:    []
})
export class DashboardAppModule { }
