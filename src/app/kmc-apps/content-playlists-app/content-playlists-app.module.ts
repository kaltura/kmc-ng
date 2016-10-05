import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule, ReactiveFormsModule }        from '@angular/forms';

import { routing} from './content-playlists-app.routes';
import { PlaylistsComponent } from './components/playlists.component';
import { PlaylistTypePipe } from './pipes/playlist.type.pipe';
import { KMCngShellCommonModule } from 'kmcng-shell';
import { DropdownModule } from 'ng2-bootstrap/ng2-bootstrap';
import { DataTableModule, SharedModule, InputTextModule, ButtonModule} from 'primeng/primeng';

@NgModule({
  imports:      [ CommonModule, FormsModule, routing, ReactiveFormsModule, KMCngShellCommonModule, DropdownModule, DataTableModule, SharedModule, InputTextModule, ButtonModule ],
  declarations: [ PlaylistsComponent, PlaylistTypePipe ],
  providers:    []
})
export class ContentPlaylistsAppModule { }
