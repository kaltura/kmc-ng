import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DetailsBarModule } from '@kaltura-ng/kaltura-ui/details-bar';

import { routing } from './content-playlists-app.routes';

import { AreaBlockerModule, StickyModule } from '@kaltura-ng/kaltura-ui';
import {
	DataTableModule,
	PaginatorModule,
	ButtonModule,
	TieredMenuModule,
	CheckboxModule,
	InputTextModule,
	CalendarModule,
	MenuModule,
  RadioButtonModule,
	SharedModule
} from 'primeng/primeng';
import { KalturaCommonModule } from '@kaltura-ng/kaltura-common';
import { KalturaPrimeNgUIModule } from '@kaltura-ng/kaltura-primeng-ui';
import {
	KalturaUIModule,
	TooltipModule
} from '@kaltura-ng/kaltura-ui';
import { AutoCompleteModule } from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import { TagsModule } from '@kaltura-ng/kaltura-ui/tags';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui/popup-widget';

import { ContentPlaylistsComponent } from './content-playlists.component';
import { PlaylistsComponentsList } from './playlists/playlists-components-list';
import { PlaylistComponentsList } from './playlist/playlist-components-list';
import { PlaylistCanDeactivate } from './playlist/playlist-can-deactivate.service';

@NgModule({
    imports: [
      CommonModule,
      AreaBlockerModule,
      DataTableModule,
      KalturaCommonModule,
      KalturaUIModule,
      PaginatorModule,
      TooltipModule,
      ButtonModule,
      TieredMenuModule,
      CheckboxModule,
      FormsModule,
      ReactiveFormsModule,
      InputTextModule,
      PopupWidgetModule,
      CalendarModule,
      MenuModule,
      RadioButtonModule,
      TagsModule,
      KalturaPrimeNgUIModule,
      AutoCompleteModule,
      SharedModule,
	  DetailsBarModule,
      RouterModule.forChild(routing),
	  StickyModule
    ],
    declarations: [
      ContentPlaylistsComponent,
      PlaylistsComponentsList,
      PlaylistComponentsList
    ],
    exports: [
    ],
    providers : [
      PlaylistCanDeactivate
    ]
})
export class ContentPlaylistsAppModule {
}
