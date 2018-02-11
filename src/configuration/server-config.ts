import  'rxjs/add/operator/takeUntil';
import  'rxjs/add/operator/delay';
import { Observable } from 'rxjs/Observable';
import { environment } from 'environments/environment';
import { globalConfig } from './global-config';
import * as Ajv from 'ajv'


const ServerConfigSchema = {
  properties: {
    kalturaServer: {
      properties: {
        uri: { type: 'string' },
        expiry: { type: 'number' },
        privileges: { type: 'string' },
        previewUIConf: { type: 'number' },
          freeTrialExpiration: {
            properties: {
                enabled: { type: 'boolean' },
                trialPeriodInDays: { type: 'number' }
            },
            required: ['enabled', 'trialPeriodInDays'],
            additionalProperties: false
        }

      },
      required: ['uri', 'expiry', 'privileges', 'previewUIConf'],
      additionalProperties: false
    },
    cdnServers: {
      properties: {
        serverUri: { type: 'string' },
        securedServerUri: { type: 'string' }
      },
      required: ['serverUri', 'securedServerUri'],
      additionalProperties: false
    },
    externalApps: {
      properties: {
        analytics: {
          properties: {
            uri: { type: 'string' },
            version: { type: 'string' }
          },
          required: ['uri', 'version'],
          additionalProperties: false
        },
        studio: {
          properties: {
            uri: { type: 'string' },
            version: { type: 'string' },
            uiConfId: { type: 'string' },
            html5_version: { type: 'string' },
            html5lib: { type: 'string' }
          },
          required: ['uri', 'version', 'uiConfId', 'html5_version', 'html5lib'],
          additionalProperties: false
        }
      },
      required: ['analytics', 'studio'],
      additionalProperties: false
    },
    externalLinks: {
      properties: {
        previewAndEmbed: {
          properties: {
            embedTypes: { type: 'string' },
            deliveryProtocols: { type: 'string' }
          },
          required: ['embedTypes', 'deliveryProtocols'],
          additionalProperties: false
        },
        kaltura: {
          properties: {
            userManual: { type: 'string' },
            support: { type: 'string' },
            signUp: { type: 'string' },
            contactUs: { type: 'string' },
            upgradeAccount: { type: 'string' },
            contactSalesforce: { type: 'string' }
          },
          required: ['userManual', 'support', 'signUp', 'contactUs', 'upgradeAccount', 'contactSalesforce'],
          additionalProperties: false
        },
        uploads: {
          properties: {
            highSpeedUpload: { type: 'string' },
            bulkUploadSamples: { type: 'string' }
          },
          required: ['highSpeedUpload', 'bulkUploadSamples'],
          additionalProperties: false
        },
        live: {
          properties: {
            akamaiEdgeServerIpURL: { type: 'string' }
          },
          required: ['akamaiEdgeServerIpURL'],
          additionalProperties: false
        }
      },
      required: ['previewAndEmbed', 'kaltura', 'uploads', 'live'],
      additionalProperties: false
    }
  },
  required: ['kalturaServer', 'cdnServers', 'externalApps', 'externalLinks'],
  additionalProperties: false
};

export interface ServerConfig {
    kalturaServer: {
        uri: string,
        expiry: number,
        privileges: string,
        previewUIConf: number,
        freeTrialExpiration: {
            enabled: boolean,
            trialPeriodInDays: number
        }
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
            const validationResult = validateSeverConfig(response);
            if (validationResult.isValid) {
              Object.assign(serverConfig, response);
            } else {
              throw Error(validationResult.error || 'Invalid server configuration')
            }
        })
        .map(() => {
            return undefined;
        });
}
