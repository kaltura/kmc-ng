import { ModuleWithProviders } from '@angular/core';
import { RouterModule }        from '@angular/router';

import {StudioUniversalComponent} from "./components/studio-universal.component";

export const routing: ModuleWithProviders = RouterModule.forChild([
  { path: '', component: StudioUniversalComponent}
]);
