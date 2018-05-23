
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
                            required: ['enabled'],
                            additionalProperties: false
                        }
                    },
                    required: ['limitAccess'],
                    additionalProperties: false
                },

            },
            required: ['uri', 'previewUIConf', 'deployUrl', 'freeTrialExpiration'],
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
                    required: ['enabled'],
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
                    required: ['enabled'],
                    additionalProperties: false
                },
                usageDashboard: {
                    properties: {
                        enabled: {type: 'boolean'},
                        uri: {type: 'string'}
                    },
                    required: ['enabled'],
                    additionalProperties: true // TODO set this to false once the server updates the runtime configuration generator for this app
                },
                liveDashboard: {
                    properties: {
                        enabled: {type: 'boolean'},
                        uri: {type: 'string'}
                    },
                    required: ['enabled'],
                    additionalProperties: false
                },
                liveAnalytics: {
                    properties: {
                        enabled: {type: 'boolean'},
                        uri: {type: 'string'},
                        uiConfId: {type: 'number'}
                    },
                    required: ['enabled'],
                    additionalProperties: false
                },
                editor: {
                    properties: {
                        enabled: {type: 'boolean'},
                        uri: {type: 'string'}
                    },
                    required: ['enabled'],
                    additionalProperties: false
                },
                kava: {
                    properties: {
                        enabled: {type: 'boolean'},
                        uri: {type: 'string'}
                    },
                    required: ['enabled'],
                    additionalProperties: false
                }
            },
            required: ['studio', 'studioV3', 'liveAnalytics', 'usageDashboard', 'liveDashboard', 'kava', 'editor'],
            additionalProperties: false
        },
        externalLinks: {
            properties: {
                previewAndEmbed: {
                    properties: {
                        embedTypes: {type: 'string'},
                        deliveryProtocols: {type: 'string'}
                    },
                    required: [],
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
                        contactSalesforce: {type: 'string'},
                        dropFoldersManual: {type: 'string'}
                    },
                    required: [],
                    additionalProperties: false
                },
                entitlements: {
                    properties: {
                        manage: {type: 'string'}
                    },
                    required: [],
                    additionalProperties: false
                },
                uploads: {
                    properties: {
                        highSpeedUpload: {type: 'string'},
                        needHighSpeedUpload: {type: 'string'},
                        bulkUploadSamples: {type: 'string'}
                    },
                    required: [],
                    additionalProperties: false
                },
                live: {
                    properties: {
                        akamaiEdgeServerIpURL: {type: 'string'}
                    },
                    required: [],
                    additionalProperties: false
                }
            },
            required: [],
            additionalProperties: false
        }
    },
    required: ['kalturaServer', 'cdnServers', 'externalApps', 'externalLinks'],
    additionalProperties: false
};
