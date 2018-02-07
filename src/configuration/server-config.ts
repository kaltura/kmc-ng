import  'rxjs/add/operator/takeUntil';
import  'rxjs/add/operator/delay';
import { Observable } from 'rxjs/Observable';
import { environment } from 'environments/environment';
import { globalConfig } from './global-config';


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
            uri: string,
            version: string
        },
        studio: {
            uri: string,
            version: string,
            path: string,
            uiConfId: string,
            html5_version: string,
            html5lib: string
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

export function initializeConfiguration(): Observable<void> {

    return getConfiguration()
        .takeUntil(Observable.of(true).delay(environment.configurationTimeout))
        .do(response => {
            Object.assign(serverConfig, response);
        })
        .map(() => {
            return undefined;
        });
}