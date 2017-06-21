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
import { KalturaPrimeNgUIModule } from '@kaltura-ng2/kaltura-primeng-ui';
import {
	KalturaUIModule,
	TooltipModule
} from '@kaltura-ng2/kaltura-ui';
import { TagsModule } from '@kaltura-ng2/kaltura-ui/tags';
import { PopupWidgetModule } from '@kaltura-ng2/kaltura-ui/popup-widget';

import { ContentPlaylistsComponent } from './content-playlists.component';
import { PlaylistComponent } from './playlist/playlist.component';
import { PlaylistDetailsComponent } from './playlist/playlist-details/playlist-details.component';
import { PlaylistContentComponent } from './playlist/playlist-content/playlist-content.component';
import { PlaylistMetadataComponent } from './playlist/playlist-metadata/playlist-metadata.component';
import { PlaylistSectionsList } from './playlist/playlist-sections-list/playlist-sections-list.component'
import { PlaylistsComponentsList } from './playlists/playlists-components-list';
import { PlaylistsStore } from './playlists/playlists-store/playlists-store.service';
import { PlaylistStore } from './playlist/playlist-store.service';

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
		KalturaPrimeNgUIModule,
		SharedModule,
        RouterModule.forChild(routing)
    ],
    declarations: [
		ContentPlaylistsComponent,
		PlaylistsComponentsList,
		PlaylistComponent,
		PlaylistDetailsComponent,
		PlaylistContentComponent,
		PlaylistMetadataComponent,
		PlaylistSectionsList
    ],
    exports: [],
    providers: [
		PlaylistsStore,
		PlaylistStore
	],
})
export class ContentPlaylistsAppModule {
}
