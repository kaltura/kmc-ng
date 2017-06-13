import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './content-playlists-app.routes';

import { AreaBlockerModule } from '@kaltura-ng2/kaltura-ui';
import {
	DataTableModule,
	PaginatorModule,
	ButtonModule,
	TieredMenuModule,
	CheckboxModule,
	InputTextModule,
	CalendarModule,
	MenuModule,
	SharedModule
} from 'primeng/primeng';
import { KalturaCommonModule } from '@kaltura-ng2/kaltura-common';
import {
	KalturaUIModule,
	TooltipModule
} from '@kaltura-ng2/kaltura-ui';
import { TagsModule } from '@kaltura-ng2/kaltura-ui/tags';
import { PopupWidgetModule } from '@kaltura-ng2/kaltura-ui/popup-widget';

import { ContentPlaylistsComponent } from './content-playlists.component';
import { PlaylistsComponentsList } from './playlists/playlists-components-list';
import { PlaylistsStore } from './playlists/playlists-store/playlists-store.service';

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
		TagsModule,
		SharedModule,
        RouterModule.forChild(routing)
    ],
    declarations: [
		ContentPlaylistsComponent,
		PlaylistsComponentsList
    ],
    exports: [],
    providers: [
		PlaylistsStore
	],
})
export class ContentPlaylistsAppModule {
}
