import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/delay';
import {globalConfig} from './global-config';
import {Observable} from 'rxjs/Observable';
import {environment} from 'environments/environment';
import * as Ajv from 'ajv';
import { ServerConfigSchema } from './server-config-schema';

/*************************************
 * Developer Notice:
 * When you add/edit/remove server configuration you should sync the following places:
 * - server-config-schema.ts > 'ServerConfigSchema' constant
 * - this file > 'ServerConfig' interface
 * - server-config.example.json (used during development)
 * - server-config.template.json (used by CI server)
 *
 * If you are modifing an External application (a.k.a standalone application):
 * - file '__local_machine_only__/README.md' > section 'Test external applications integration'
 * - for new external apps you should also update the zip file 'samples-for-tests-only.zip'
 *************************************/

export interface ServerConfig {
    kalturaServer: {
        uri: string,
        previewUIConf: number,
        freeTrialExpiration: {
            enabled: boolean,
            trialPeriodInDays: number
        }
    };
    cdnServers: {
        serverUri: string,
        securedServerUri: string
    };
    externalApps: {
        studio: {
            enabled: boolean,
            uri: string,
            html5_version: string,
            html5lib: string,
            showFlashStudio: boolean
        },
        studioV3: {
            enabled: boolean,
            uri: string,
            html5_version: string,
            html5lib: string,
            showFlashStudio: boolean
        },
        liveDashboard: {
            enabled: boolean,
            uri: string,
        },
        kava: {
            enabled: boolean,
            uri: string
        },
        usageDashboard: {
            enabled: boolean,
            uri: string,
            uiConfId: number,
            map_urls: string[],
            map_zoom_levels: string,
        },
        liveAnalytics: {
            enabled: boolean,
            uiConfId: number,
            uri: string
        },
        clipAndTrim: {
          enabled: boolean,
          uri: string
        },
        advertisements: {
          enabled: boolean,
          uri: string
        }
    };
    externalLinks: {
        previewAndEmbed: {
            embedTypes: string,
            deliveryProtocols: string
        },
        entitlements: {
            manage: string
        },
        kaltura: {
            userManual: string,
            kmcOverview: string,
            mediaManagement: string,
            support: string,
            signUp: string,
            contactUs: string,
            upgradeAccount: string,
            contactSalesforce: string,
        },
        uploads: {
            highSpeedUpload: string,
            needHighSpeedUpload: string,
            bulkUploadSamples: string
        },
        live: {
            akamaiEdgeServerIpURL: string
        }
    };
}

export const serverConfig: ServerConfig = <any>{};

export function getKalturaServerUri(suffix: string = ''): string {
    if (serverConfig.kalturaServer) {
        const useHttpsProtocol = globalConfig.kalturaServer.useSecuredProtocol;
        const serverEndpoint = serverConfig.kalturaServer.uri;
        return `${useHttpsProtocol ? 'https' : 'http'}://${serverEndpoint}${suffix}`;
    } else {
        throw new Error(`cannot provide kaltura server uri. server configuration wasn't loaded already`);
    }
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
    if (window && (<any>window).kmcConfig) {
        return Observable.of((<any>window).kmcConfig);
    }

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
            } else {
                throw Error(validationResult.error || 'Invalid server configuration');
            }
        })
        .map(() => {
            return undefined;
        });
}
