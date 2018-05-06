
/*************************************
 * Developer Notice:
 * When you add/edit/remove server configuration you should sync the following places:
 * - this file > 'ServerConfigSchema' constant
 * - server-config.ts > 'ServerConfig' interface
 * - server-config.example.json (used during development)
 * - server-config.template.json (used by CI server)
 *
 * If you are modifing an External application (a.k.a standalone application):
 * - file '__local_machine_only__/README.md' > section 'Test external applications integration'
 * - for new external apps you should also update the zip file 'samples-for-tests-only.zip'
 *************************************/

export const ServerConfigSchema = {
    properties: {
        kalturaServer: {
            properties: {
                uri: {type: 'string'},
                deployUrl: {type: 'string'},
                previewUIConf: {type: 'number'},
                freeTrialExpiration: {
                    properties: {
                        enabled: {type: 'boolean'},
                        trialPeriodInDays: {type: 'number'}
                    },
                    required: ['enabled', 'trialPeriodInDays'],
                    additionalProperties: false
                },
                login: {
                    properties: {
                        limitAccess: {
                            properties: {
                                enabled: {type: 'boolean'},
                                verifyBetaServiceUrl: { type: 'string' },
                            },
                            required: ['enabled', 'verifyBetaServiceUrl'],
                            additionalProperties: false
                        }
                    },
                    required: ['limitAccess'],
                    additionalProperties: false
                },

            },
            required: ['uri', 'previewUIConf', 'deployUrl', 'freeTrialExpiration', 'login'],
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
                        html5_version: {type: 'string'},
                        html5lib: {type: 'string'},
                        showStudioV3: {type: 'boolean'}
                    },
                    required: ['enabled', 'uri', 'html5_version', 'html5lib'],
                    additionalProperties: false
                },
                studioV3: {
                    properties: {
                        enabled: {type: 'boolean'},
                        uri: {type: 'string'},
                        html5_version: {type: 'string'},
                        html5lib: {type: 'string'},
                        showHTMLStudio: {type: 'boolean'}
                    },
                    required: ['enabled', 'uri', 'html5_version', 'html5lib'],
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
                        uri: {type: 'string'}
                    },
                    required: ['enabled', 'uri'],
                    additionalProperties: false
                },
                liveAnalytics: {
                    properties: {
                        enabled: {type: 'boolean'},
                        uri: {type: 'string'},
                        uiConfId: {type: 'number'}
                    },
                    required: ['enabled', 'uri'],
                    additionalProperties: false
                },
                clipAndTrim: {
                    properties: {
                        enabled: {type: 'boolean'},
                        uri: {type: 'string'}
                    },
                    required: ['enabled', 'uri'],
                    additionalProperties: false
                },
                advertisements: {
                    properties: {
                        enabled: {type: 'boolean'},
                        uri: {type: 'string'}
                    },
                    required: ['enabled', 'uri'],
                    additionalProperties: false
                },
                kava: {
                    properties: {
                        enabled: {type: 'boolean'},
                        uri: {type: 'string'}
                    },
                    required: ['enabled', 'uri'],
                    additionalProperties: false
                }
            },
            required: ['studio', 'usageDashboard', 'liveDashboard', 'kava'],
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
                        kmcOverview: {type: 'string'},
                        mediaManagement: {type: 'string'},
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
                entitlements: {
                    properties: {
                        manage: {type: 'string'}
                    },
                    required: ['manage'],
                    additionalProperties: false
                },
                uploads: {
                    properties: {
                        highSpeedUpload: {type: 'string'},
                        needHighSpeedUpload: {type: 'string'},
                        bulkUploadSamples: {type: 'string'}
                    },
                    required: ['highSpeedUpload', 'needHighSpeedUpload', 'bulkUploadSamples'],
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
