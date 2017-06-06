import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { routing } from './content-playlists-app.routes';
import { ContentPlaylistsComponent } from './content-playlists.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routing)
    ],
    declarations: [
		ContentPlaylistsComponent
    ],
    exports: [],
    providers: [],
})
export class ContentPlaylistsAppModule {
}
