import { ModuleWithProviders } from '@angular/core';
import { RouterModule }        from '@angular/router';

import {EntriesComponent} from "./components/entries.component";

export const routing: ModuleWithProviders = RouterModule.forChild([
  { path: '', component: EntriesComponent}
]);
