import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { routing } from './content-playlists-app.routes';

import { AreaBlockerModule } from '@kaltura-ng2/kaltura-ui';
import {
	DataTableModule,
	PaginatorModule,
	ButtonModule,
	TieredMenuModule,
	CheckboxModule,
	SharedModule
} from 'primeng/primeng';
import { KalturaCommonModule } from '@kaltura-ng2/kaltura-common';
import {
	KalturaUIModule,
	TooltipModule
} from '@kaltura-ng2/kaltura-ui';

import { ContentPlaylistsComponent } from './content-playlists.component';
import { PlaylistsComponentsList } from './playlists';
import { PlaylistsStore } from './playlists/playlists-store';

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
