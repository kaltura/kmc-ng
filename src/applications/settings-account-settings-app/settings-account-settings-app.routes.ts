import { Route } from '@angular/router';
import { SettingsAccountSettingsComponent } from './settings-account-settings.component';
import { SettingsAccountSettingsCanDeactivateService } from './settings-account-settings-can-deactivate.service';

export const routing: Route[] = [
    { path: '', component: SettingsAccountSettingsComponent, canDeactivate: [SettingsAccountSettingsCanDeactivateService] }
];
