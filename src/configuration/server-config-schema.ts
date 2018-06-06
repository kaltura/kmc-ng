
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
                defaultPrivileges: {type: 'string'},
                deployUrl: {type: 'string'},
                previewUIConf: {type: 'number'},
                resetPasswordUri: {type: 'string'},
                freeTrialExpiration: {
                    properties: {
                        trialPeriodInDays: {type: 'number'}
                    },
                    required: ['trialPeriodInDays'],
                    additionalProperties: true
                },
                limitAccess: {
                    properties: {
                        serviceUrl: { type: 'string' },
                    },
                    required: ['serviceUrl'],
                    additionalProperties: true
                }
            },
            required: ['uri', 'previewUIConf', 'deployUrl'],
            additionalProperties: true
        },
        cdnServers: {
            properties: {
                serverUri: {type: 'string'},
                securedServerUri: {type: 'string'}
            },
            required: ['serverUri', 'securedServerUri'],
            additionalProperties: true
        },
        externalApps: {
            properties: {
                studioV2: {
                    properties: {
                        uri: {type: 'string'},
                        html5_version: {type: 'string'},
                        html5lib: {type: 'string'}
                    },
                    required: ['uri', 'html5_version', 'html5lib'],
                    additionalProperties: true
                },
                studioV3: {
                    properties: {
                        uri: {type: 'string'},
                        html5_version: {type: 'string'},
                        html5lib: {type: 'string'},
                        playerVersionsMap: {type: 'string'}
                    },
                    required: ['uri', 'html5_version', 'html5lib', 'playerVersionsMap'],
                    additionalProperties: true
                },
                usageDashboard: {
                    properties: {
                        uri: {type: 'string'}
                    },
                    required: ['uri'],
                    additionalProperties: true
                },
                liveDashboard: {
                    properties: {
                        uri: {type: 'string'}
                    },
                    required: ['uri'],
                    additionalProperties: true
                },
                liveAnalytics: {
                    properties: {
                        uri: {type: 'string'},
                        uiConfId: {type: 'number'},
                        mapUrls: { type: 'array', items: { type: 'string' } },
                        mapZoomLevels: {type: 'string'}
                    },
                    required: ['uri', 'uiConfId', 'mapUrls', 'mapZoomLevels'],
                    additionalProperties: true
                },
                editor: {
                    properties: {
                        uri: {type: 'string'}
                    },
                    required: ['uri'],
                    additionalProperties: true
                },
                kava: {
                    properties: {
                        uri: {type: 'string'}
                    },
                    required: ['uri'],
                    additionalProperties: true
                }
            },
            required: [],
            additionalProperties: true
        },
        externalLinks: {
            properties: {
                previewAndEmbed: {
                    properties: {
                        embedTypes: {type: 'string'},
                        deliveryProtocols: {type: 'string'}
                    },
                    required: [],
                    additionalProperties: true
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
                        contactSalesforce: {type: 'string'},
                        dropFoldersManual: {type: 'string'}
                    },
                    required: [],
                    additionalProperties: true
                },
                entitlements: {
                    properties: {
                        manage: {type: 'string'}
                    },
                    required: [],
                    additionalProperties: true
                },
                uploads: {
                    properties: {
                        highSpeedUpload: {type: 'string'},
                        needHighSpeedUpload: {type: 'string'},
                        bulkUploadSamples: {type: 'string'}
                    },
                    required: [],
                    additionalProperties: true
                },
                live: {
                    properties: {
                        akamaiEdgeServerIpURL: {type: 'string'}
                    },
                    required: [],
                    additionalProperties: true
                }
            },
            required: [],
            additionalProperties: true
        }
    },
    required: ['kalturaServer', 'cdnServers', 'externalApps', 'externalLinks'],
    additionalProperties: true
};
