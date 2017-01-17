import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule, ReactiveFormsModule }        from '@angular/forms';

import { routing} from './content-playlists-app.routes';
import { PlaylistsComponent } from './components/playlists.component';
import { KMCShellModule } from 'kmc-shell';
import { DataTableModule, SharedModule, InputTextModule, ButtonModule} from 'primeng/primeng';

@NgModule({
  imports:      [ CommonModule, FormsModule, routing, ReactiveFormsModule, KMCShellModule, DataTableModule, SharedModule, InputTextModule, ButtonModule ],
  declarations: [ PlaylistsComponent ],
  providers:    []
})
export class ContentPlaylistsAppModule { }
