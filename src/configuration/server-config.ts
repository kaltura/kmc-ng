import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/delay';
import {Observable} from 'rxjs/Observable';
import {environment} from 'environments/environment';
import {globalConfig} from './global-config';


export interface ServerConfig {
    kalturaServer: {
        uri: string,
        expiry: number,
        privileges: string,
        previewUIConf: number
    },
    cdnServers: {
        serverUri: string,
        securedServerUri: string
    },
    externalApps: {
        analytics: {
          enabled: boolean,
          uri: string,
          version: string
        },
        studio: {
          enabled: boolean,
          uri: string,
          version: string,
          path: string,
          uiConfId: string,
          html5_version: string,
          html5lib: string
        },
        liveDashboard: {
          enabled: boolean,
          uri: string,
          version: string
        },
        usageDashboard: {
          enabled: boolean,
          uri: string,
          uiConfId: number,
          map_urls: string[],
          map_zoom_levels: string,
        }
    },
    externalLinks: {
        previewAndEmbed: {
            embedTypes: string,
            deliveryProtocols: string
        },
        kaltura: {
            userManual: string,
            support: string,
            signUp: string,
            contactUs: string,
            upgradeAccount: string,
            contactSalesforce: string,
        },
        uploads: {
            highSpeedUpload: string,
            bulkUploadSamples: string
        },
        live: {
            akamaiEdgeServerIpURL: string
        }
    }
}

export const serverConfig: ServerConfig = <any>{};

export function getKalturaServerUri(suffix: string = ''): string{
    if (serverConfig)
    {
        const useHttpsProtocol = globalConfig.kalturaServer.useSecuredProtocol;
        const serverEndpoint = serverConfig.kalturaServer.uri;
        return `${useHttpsProtocol ? 'https' : 'http'}://${serverEndpoint}${suffix}`;
    }else {
        throw new Error('cannot provide kaltura server uri. missing server configuration');
    }
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
                    resp = new Error(xhr.responseText);
                }

                if (resp instanceof Error) {
                    observer.error(resp);
                } else {
                    observer.next(resp);
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

function isStudioAppValid(): boolean {
  let isValid = false;
  if (serverConfig.externalApps.studio.enabled) {
    isValid =
      !!serverConfig.externalApps.studio.uri &&
      !serverConfig.externalApps.studio.uri.match(/\s/g) && // not contains white spaces
      !!serverConfig.externalApps.studio.version &&
      !!serverConfig.externalApps.studio.path &&
      !!serverConfig.externalApps.studio.uiConfId &&
      !!serverConfig.externalApps.studio.html5_version &&
      !!serverConfig.externalApps.studio.html5lib;

    if (!isValid) {
      console.warn('Cannot enable Studio - configuration is invalid for Studio')
    }
  }
  return isValid;
}

function isLiveDashboardAppValid(): boolean {
  let isValid = false;
  if (serverConfig.externalApps.liveDashboard.enabled) {
    isValid =
      !!serverConfig.externalApps.liveDashboard.uri &&
      !serverConfig.externalApps.liveDashboard.uri.match(/\s/g) && // not contains white spaces
      !!serverConfig.externalApps.liveDashboard.version;

    if (!isValid) {
      console.warn('Cannot enable Live Dashboard - configuration is invalid for Live Dashboard')
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
      console.warn('Cannot enable Usage Dashboard - configuration is invalid for Usage Dashboard')
    }
  }
  return isValid;
}


export function initializeConfiguration(): Observable<void> {

    return getConfiguration()
        .takeUntil(Observable.of(true).delay(environment.configurationTimeout))
        .do(response => {
            Object.assign(serverConfig, response);
            serverConfig.externalApps.studio.enabled = isStudioAppValid();
            serverConfig.externalApps.liveDashboard.enabled = isLiveDashboardAppValid();
            serverConfig.externalApps.usageDashboard.enabled = isUsageDashboardAppValid();
        })
        .map(() => {
            return undefined;
        });
}
