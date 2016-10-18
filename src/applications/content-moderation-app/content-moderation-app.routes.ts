import { ModuleWithProviders } from '@angular/core';
import { RouterModule }        from '@angular/router';

import {ModerationComponent} from "./components/moderation.component";

export const routing: ModuleWithProviders = RouterModule.forChild([
  { path: '', component: ModerationComponent}
]);
