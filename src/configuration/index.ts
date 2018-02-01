
import { dynamicApplicationConfig, DynamicApplicationConfig } from './dynamic-application-config';
import { sharedModulesConfig, SharedModulesConfig } from 'app-shared/shared-modules-config';
import { subApplicationsConfig, SubApplicationsConfig } from '../applications/sub-applications-config';
import { StaticApplicationConfig } from './static-application-config';
import { Observable } from 'rxjs/Observable';
import deepmerge from 'deepmerge';

export interface GlobalConfiguration {
    appVersion: string
}

const _globalConfiguration: GlobalConfiguration = {
    appVersion: '3.5.0'
}

export type ApplicationConfiguration = GlobalConfiguration & StaticApplicationConfig & DynamicApplicationConfig & SharedModulesConfig & SubApplicationsConfig;

export let environment: ApplicationConfiguration = <any>{};

export function initializeConfiguration(appConfiguration: StaticApplicationConfig): Observable<void> {

    // set conf
    environment = deepmerge.all<any>([_globalConfiguration, sharedModulesConfig, subApplicationsConfig, appConfiguration]);

    return Observable.create(observer =>
    {
        setTimeout(() => {
            const dynamicConfiguration = dynamicApplicationConfig; // TEMPORARY - should load from server

            environment = deepmerge(environment, dynamicConfiguration);

            observer.next(undefined);
            observer.complete();
        });
    })
};
