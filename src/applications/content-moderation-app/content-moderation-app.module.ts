import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routing } from './content-moderation-app.routes';

import { AreaBlockerModule } from '@kaltura-ng/kaltura-ui';
import {
	DataTableModule,
	PaginatorModule,
	ButtonModule,
	MenuModule,
	SharedModule
} from 'primeng/primeng';
import { KalturaCommonModule } from '@kaltura-ng/kaltura-common';
import { KalturaPrimeNgUIModule } from '@kaltura-ng/kaltura-primeng-ui';
import {
	KalturaUIModule,
  TooltipModule
} from '@kaltura-ng/kaltura-ui';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui/popup-widget';

import { ContentModerationComponent } from './content-moderation.component';
import { EntriesComponentsList } from './entries/entries-components-list';

@NgModule({
    imports: [
      CommonModule,
      AreaBlockerModule,
      DataTableModule,
      KalturaCommonModule,
      KalturaUIModule,
      TooltipModule,
      PaginatorModule,
      ButtonModule,
      PopupWidgetModule,
      MenuModule,
      KalturaPrimeNgUIModule,
      SharedModule,
      RouterModule.forChild(routing)
    ],
    declarations: [
      ContentModerationComponent,
      EntriesComponentsList
    ],
    exports: [
    ],
    providers : []
})
export class ContentModerationAppModule {
}
