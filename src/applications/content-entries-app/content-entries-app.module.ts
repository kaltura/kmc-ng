import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule, ReactiveFormsModule }        from '@angular/forms';
import { KalturaUIModule } from '@kaltura-ng2/kaltura-ui';
import { PopupWidgetModule } from '@kaltura-ng2/kaltura-ui/popup-widget';
import { TagsModule } from '@kaltura-ng2/kaltura-ui/tags';
import { KalturaPrimeNgUIModule } from '@kaltura-ng2/kaltura-primeng-ui';
import { TreeModule, TieredMenuModule, CheckboxModule, DataTableModule, SharedModule, InputTextModule, ButtonModule, AccordionModule, CalendarModule,  MultiSelectModule, PaginatorModule, MenuModule, TooltipModule } from 'primeng/primeng';
import { KalturaCommonModule } from '@kaltura-ng2/kaltura-common';



import { routing } from './content-entries-app.routes';
import { EntriesComponent } from './components/entries.component';
import { KMCShellModule } from 'kmc-shell';
import { kEntriesTableComponent } from './components/entries-table.component';
import { EntryDetailsComponent } from './components/entry-details/entry-details.component';
import { KMCContentUIModule } from "../../shared/kmc-content-ui/kmc-content-ui.module";

@NgModule({
  imports:      [
      AccordionModule,
      ButtonModule,
      CalendarModule,
      CheckboxModule,
      CommonModule,
	  TooltipModule,
      KalturaCommonModule,
      DataTableModule,
      FormsModule,
      InputTextModule,
      KalturaPrimeNgUIModule,
      KalturaUIModule,
      KMCContentUIModule,
      KMCShellModule,
      MenuModule,
      MultiSelectModule,
      PaginatorModule,
      PopupWidgetModule,
      ReactiveFormsModule,
      routing,
      SharedModule,
      TieredMenuModule,
      TreeModule,
      TagsModule
    ],
  declarations: [
    EntriesComponent,
      kEntriesTableComponent,
	  EntryDetailsComponent
  ],
  providers:    [
  ]
})
export class ContentEntriesAppModule { }
