
export interface DynamicApplicationConfig {
    core: {
        kaltura: {
            serverEndpoint : string,
            cdnUrl: string,
            legacyKmcUrl: string,
            expiry: string,
            limitToParentId? : number,
            privileges: string,
            previewUIConf: string,
            liveAnalyticsVersion: string,
            securedCdnUrl: string,
            contactsalesforce: string
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
        },
    }
}


