import { ModuleWithProviders } from '@angular/core';
import { RouterModule }        from '@angular/router';

import {PlaylistsComponent} from "./components/playlists.component";

export const routing: ModuleWithProviders = RouterModule.forChild([
  { path: '', component: PlaylistsComponent}
]);
