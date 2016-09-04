import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule, ReactiveFormsModule }        from '@angular/forms';
import { DropdownModule } from 'ng2-bootstrap/ng2-bootstrap';

import { routing} from './content-playlists-app.routes';
import { PlaylistsComponent } from './components/playlists.component';
import { PlaylistTypePipe } from './pipes/playlist.type.pipe';
import { TimePipe } from './pipes/time.pipe';

@NgModule({
  imports:      [ CommonModule, FormsModule, routing, ReactiveFormsModule, DropdownModule ],
  declarations: [ PlaylistsComponent, PlaylistTypePipe, TimePipe ],
  providers:    []
})
export class ContentPlaylistsAppModule { }
