import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';

import { routing} from './dashboard-app.routes';
import { DashboardComponent } from "./components/dashboard.component";
import { TranslateModule } from 'ng2-translate/ng2-translate';

@NgModule({
  imports:      [ CommonModule, routing, TranslateModule ],
  declarations: [ DashboardComponent ],
  providers:    []
})
export class DashboardAppModule { }
