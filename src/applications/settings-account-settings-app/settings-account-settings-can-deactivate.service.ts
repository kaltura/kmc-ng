import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { SettingsAccountSettingsComponent } from './settings-account-settings.component';

@Injectable()
export class SettingsAccountSettingsCanDeactivateService implements CanDeactivate<SettingsAccountSettingsComponent> {
    constructor() {
    }

    canDeactivate(component: SettingsAccountSettingsComponent): Observable<boolean> {
        return component.canLeaveWithoutSaving();
    }
}
