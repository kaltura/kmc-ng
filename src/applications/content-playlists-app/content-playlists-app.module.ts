import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { routing } from './content-playlists-app.routes';

import { AreaBlockerModule } from '@kaltura-ng2/kaltura-ui';
import {
	DataTableModule,
	SharedModule
} from 'primeng/primeng';
import { KalturaCommonModule } from '@kaltura-ng2/kaltura-common';
import { KalturaUIModule } from '@kaltura-ng2/kaltura-ui';

import { ContentPlaylistsComponent } from './content-playlists.component';
import { PlaylistsComponentsList } from './playlists';
import { PlaylistsStore } from './playlists/playlists-store';

@NgModule({
    imports: [
        CommonModule,
		AreaBlockerModule,
		DataTableModule,
		SharedModule,
		KalturaCommonModule,
		KalturaUIModule,
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
