import  'rxjs/add/operator/takeUntil';
import  'rxjs/add/operator/delay';
import { Observable } from 'rxjs/Observable';
import { environment } from 'environments/environment';
import { globalConfig } from './global-config';


export interface ServerConfig {
    core: {
        kaltura: {
            serverEndpoint : string,
            cdnUrl: string,
            legacyKmcUrl: string,
            expiry: string,
            privileges: string,
            previewUIConf: string,
            liveAnalyticsVersion: string,
            securedCdnUrl: string,
            contactsalesforce: string
        }
    },
    externalLinks: {
        USER_MANUAL: string,
        SUPPORT: string,
        SIGNUP: string,
        CONTACT_US: string,
        HIGH_SPEED_UPLOAD: string,
        UPGRADE_ACCOUNT: string,
        EMBED_HELP1: string,
        EMBED_HELP2: string,
        BULK_UPLOAD_SAMPLES: string
    }
}

export const serverConfig: ServerConfig = <any>{};

export function getKalturaServerUri(suffix: string = ''): string{
    if (serverConfig)
    {
        const useHttpsProtocol = globalConfig.server.useSecuredProtocol;
        const serverEndpoint = serverConfig.core.kaltura.serverEndpoint;
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
                        if (globalConfig.production) {
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

        xhr.open('Get', `${environment.configurationUri}?v=${globalConfig.appVersion}`);

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