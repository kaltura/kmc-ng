
import { DynamicApplicationConfig } from './dynamic-application-config';
import { sharedModulesConfig, SharedModulesConfig } from 'app-shared/shared-modules-config';
import { subApplicationsConfig, SubApplicationsConfig } from '../applications/sub-applications-config';
import { StaticApplicationConfig } from './static-application-config';
import { Observable } from 'rxjs/Observable';
import deepmerge from 'deepmerge';
import { environment as appEnvironment } from 'kmc-app/environments/environment';
import  'rxjs/add/operator/takeUntil';
import  'rxjs/add/operator/delay';

export interface GlobalConfiguration {
    appVersion: string,
    temporaryKey: string
}

const _globalConfiguration: GlobalConfiguration = {
    appVersion: '3.6.1',
    temporaryKey: 'will be removed in version 3.7.0'
}

export type ApplicationConfiguration = GlobalConfiguration & StaticApplicationConfig & DynamicApplicationConfig & SharedModulesConfig & SubApplicationsConfig;

export let environment: ApplicationConfiguration = <any>{};

function getConfiguration(): Observable<DynamicApplicationConfig> {
   return Observable.create(observer =>
   {
       let completed = false;
       const xhr = new XMLHttpRequest();

       xhr.onreadystatechange = function () {
           if (xhr.readyState === 4) {
               let resp;

               completed = true;

               try {
                   if (xhr.status === 200) {
                       resp = JSON.parse(xhr.response);
                   } else {
                       if (appEnvironment.production) {
                           resp = new Error('failed to load configuration file from server with error ' + xhr.statusText);
                       }else {
                           resp = new Error('failed to load configuration file from server with error ' + xhr.statusText + ' (did you remember to create a configuration file from the provided template in the app folder?)');
                       }

                   }
               } catch (e) {
                   resp = new Error(xhr.responseText);
               }

               if (resp instanceof Error) {
                   observer.error(resp);
               } else {
                   observer.next(resp);
               }
           }
       };

       xhr.open('Get', `${appEnvironment.configurationUri}?v=${environment.appVersion}`);

       xhr.send();

       return () =>
       {
           if (!completed) {
               console.warn('request to get application configuration was aborted');
               xhr.abort();
           }
       }
   });
}

export function initializeConfiguration(appConfiguration: StaticApplicationConfig): Observable<void> {

    // set conf
    environment = deepmerge.all<any>([_globalConfiguration, sharedModulesConfig, subApplicationsConfig, appConfiguration]);

    return getConfiguration()
        .takeUntil(Observable.of(true).delay(appEnvironment.configurationTimeout))
        .do(dynamicConfiguration => {
            environment = deepmerge(environment, dynamicConfiguration);
        })
        .map(() => {
            return undefined;
        });
}