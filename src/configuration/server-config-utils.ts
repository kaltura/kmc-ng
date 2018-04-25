import {Observable} from 'rxjs/Observable';
import {environment} from 'environments/environment';
import * as Ajv from 'ajv';
import {serverConfig, ServerConfig, ServerConfigSchema} from 'config/server';
import {globalConfig} from 'config/global';

function isStudioAppValid(): boolean {
    let isValid = false;
    if (serverConfig.externalApps.studio.enabled) {
        isValid =
            !!serverConfig.externalApps.studio.uri &&
            !serverConfig.externalApps.studio.uri.match(/\s/g) && // not contains white spaces
            !!serverConfig.externalApps.studio.html5_version &&
            !!serverConfig.externalApps.studio.html5lib;

        if (!isValid) {
            console.warn('Disabling Studio standalone application - configuration is invalid');
        }
    }
    return isValid;
}

function isLiveDashboardAppValid(): boolean {
    let isValid = false;
    if (serverConfig.externalApps.liveDashboard.enabled) {
        isValid =
            !!serverConfig.externalApps.liveDashboard.uri &&
            !serverConfig.externalApps.liveDashboard.uri.match(/\s/g); // not contains white spaces
        if (!isValid) {
            console.warn('Disabling Live Dashboard standalone application - configuration is invalid');
        }
    }
    return isValid;
}

function isKavaAppValid(): boolean {
    let isValid = false;
    if (serverConfig.externalApps.kava.enabled) {
        isValid =
            !!serverConfig.externalApps.kava.uri &&
            !serverConfig.externalApps.kava.uri.match(/\s/g); // not contains white spaces

        if (!isValid) {
            console.warn('Disabling KAVA standalone application - configuration is invalid');
        }
    }
    return isValid;
}

function isUsageDashboardAppValid(): boolean {
    let isValid = false;
    if (serverConfig.externalApps.usageDashboard.enabled) {
        isValid =
            !!serverConfig.externalApps.usageDashboard.uri &&
            !serverConfig.externalApps.usageDashboard.uri.match(/\s/g) && // not contains white spaces
            typeof (serverConfig.externalApps.usageDashboard.uiConfId) !== 'undefined' &&
            serverConfig.externalApps.usageDashboard.uiConfId !== null &&
            serverConfig.externalApps.usageDashboard.map_urls &&
            serverConfig.externalApps.usageDashboard.map_urls.length &&
            serverConfig.externalApps.usageDashboard.map_urls.indexOf('') === -1 && // no empty url
            !!serverConfig.externalApps.usageDashboard.map_zoom_levels;

        if (!isValid) {
            console.warn('Disabling Usage Dashboard standalone application - configuration is invalid')
        }
    }
    return isValid;
}

function isClipAndTrimAppValid(): boolean {
  let isValid = false;
  if (serverConfig.externalApps.clipAndTrim.enabled) {
    isValid =
      !!serverConfig.externalApps.clipAndTrim.uri &&
      !serverConfig.externalApps.clipAndTrim.uri.match(/\s/g); // not contains white spaces

    if (!isValid) {
      console.warn('Disabling clipAndTrim (kedit) standalone application - configuration is invalid');
    }
  }
  return isValid;
}


function isAdvertisementsAppValid(): boolean {
  let isValid = false;
  if (serverConfig.externalApps.advertisements.enabled) {
    isValid =
      !!serverConfig.externalApps.advertisements.uri &&
      !serverConfig.externalApps.advertisements.uri.match(/\s/g); // not contains white spaces

    if (!isValid) {
      console.warn('Disabling Advertisements (kedit) standalone application - configuration is invalid');
    }
  }
  return isValid;
}


function validateSeverConfig(data: ServerConfig): { isValid: boolean, error?: string } {
    const ajv = new Ajv({allErrors: true, verbose: true});
    const validate = ajv.compile(ServerConfigSchema);
    const isValid = !!validate(data);
    let error = null;

    if (!isValid) {
        error = ajv.errorsText(validate.errors);
    }

    return { isValid, error };
}


function getConfiguration(): Observable<ServerConfig> {
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
                        if (globalConfig.client.production) {
                            resp = new Error('failed to load configuration file from server with error ' + xhr.statusText);
                        }else {
                            resp = new Error('failed to load configuration file from server with error ' + xhr.statusText + ' (did you remember to create a configuration file from the provided template in the app folder?)');
                        }

                    }
                } catch (e) {
                    resp = e;
                }

                if (resp instanceof Error) {
                    observer.error(resp);
                } else {
                    observer.next(resp);
                    observer.complete();
                }
            }
        };

        xhr.open('Get', `${environment.configurationUri}?v=${globalConfig.client.appVersion}`);

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

export function initializeConfiguration(): Observable<void> {

    return getConfiguration()
        .takeUntil(Observable.of(true).delay(environment.configurationTimeout))
        .do(response => {
            const validationResult = validateSeverConfig(response);
            if (validationResult.isValid) {
                Object.assign(serverConfig, response);
                serverConfig.externalApps.studio.enabled = isStudioAppValid();
                serverConfig.externalApps.kava.enabled = isKavaAppValid();
                serverConfig.externalApps.liveDashboard.enabled = isLiveDashboardAppValid();
                serverConfig.externalApps.usageDashboard.enabled = isUsageDashboardAppValid();
                serverConfig.externalApps.clipAndTrim.enabled = isClipAndTrimAppValid();
                serverConfig.externalApps.advertisements.enabled = isAdvertisementsAppValid();

            } else {
                throw Error(validationResult.error || 'Invalid server configuration')
            }
        })
        .map(() => {
            return undefined;
        });
}

