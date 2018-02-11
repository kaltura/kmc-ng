import  'rxjs/add/operator/takeUntil';
import  'rxjs/add/operator/delay';
import { globalConfig } from './global-config';


export const ServerConfigSchema = {
    properties: {
        kalturaServer: {
            properties: {
                uri: {type: 'string'},
                expiry: {type: 'number'},
                privileges: {type: 'string'},
                previewUIConf: {type: 'number'},
                freeTrialExpiration: {
                    properties: {
                        enabled: {type: 'boolean'},
                        trialPeriodInDays: {type: 'number'}
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
                serverUri: {type: 'string'},
                securedServerUri: {type: 'string'}
            },
            required: ['serverUri', 'securedServerUri'],
            additionalProperties: false
        },
        externalApps: {
            properties: {
                studio: {
                    properties: {
                        enabled: {type: 'boolean'},
                        uri: {type: 'string'},
                        version: {type: 'string'},
                        uiConfId: {type: 'string'},
                        html5_version: {type: 'string'},
                        html5lib: {type: 'string'}
                    },
                    required: ['enabled', 'uri', 'version', 'uiConfId', 'html5_version', 'html5lib'],
                    additionalProperties: false
                },
                usageDashboard: {
                    properties: {
                        enabled: {type: 'boolean'},
                        uri: {type: 'string'},
                        uiConfId: {type: 'number'},
                        map_urls: { type: 'array', items: { type: 'string' } },
                        map_zoom_levels: {type: 'string'}
                    },
                    required: ['enabled', 'uri', 'uiConfId', 'map_urls', 'map_zoom_levels'],
                    additionalProperties: false
                },
                liveDashboard: {
                    properties: {
                        enabled: {type: 'boolean'},
                        uri: {type: 'string'},
                        version: {type: 'string'}
                    },
                    required: ['enabled', 'uri', 'version'],
                    additionalProperties: false
                },
            },
            required: ['studio', 'usageDashboard', 'liveDashboard'],
            additionalProperties: false
        },
        externalLinks: {
            properties: {
                previewAndEmbed: {
                    properties: {
                        embedTypes: {type: 'string'},
                        deliveryProtocols: {type: 'string'}
                    },
                    required: ['embedTypes', 'deliveryProtocols'],
                    additionalProperties: false
                },
                kaltura: {
                    properties: {
                        userManual: {type: 'string'},
                        support: {type: 'string'},
                        signUp: {type: 'string'},
                        contactUs: {type: 'string'},
                        upgradeAccount: {type: 'string'},
                        contactSalesforce: {type: 'string'}
                    },
                    required: ['userManual', 'support', 'signUp', 'contactUs', 'upgradeAccount', 'contactSalesforce'],
                    additionalProperties: false
                },
                uploads: {
                    properties: {
                        highSpeedUpload: {type: 'string'},
                        bulkUploadSamples: {type: 'string'}
                    },
                    required: ['highSpeedUpload', 'bulkUploadSamples'],
                    additionalProperties: false
                },
                live: {
                    properties: {
                        akamaiEdgeServerIpURL: {type: 'string'}
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
        studio: {
            enabled: boolean,
            uri: string,
            version: string,
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
