import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule, ReactiveFormsModule }        from '@angular/forms';

import { routing} from './content-playlists-app.routes';
import { PlaylistsComponent } from './components/playlists.component';
import { PlaylistTypePipe } from './pipes/playlist.type.pipe';
import { KMCngShellCommonModule } from '@kaltura/kmcng-shell';

@NgModule({
  imports:      [ CommonModule, FormsModule, routing, ReactiveFormsModule, KMCngShellCommonModule ],
  declarations: [ PlaylistsComponent, PlaylistTypePipe ],
  providers:    []
})
export class ContentPlaylistsAppModule { }
