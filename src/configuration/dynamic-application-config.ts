
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

export const dynamicApplicationConfig: DynamicApplicationConfig = {
    core: {
        kaltura: {
            "serverEndpoint" : "www.kaltura.com",
            "cdnUrl": "http://cdnapi.kaltura.com",
            "legacyKmcUrl": "kmc.kaltura.com",
            "expiry": "86400",
            "limitToParentId" : null,
            "privileges": "disableentitlement",
            "previewUIConf": "38524931",
            "liveAnalyticsVersion": "v2.6",
            "securedCdnUrl": "https://cdnapisec.kaltura.com",
            "contactsalesforce": "https://www.kaltura.com/index.php/partnerservices2/contactsalesforce"
        },
        "externalLinks": {
            "USER_MANUAL": "https://kmc.kaltura.com/content/docs/pdf/KMC_User_Manual.pdf",
            "SUPPORT": "http://kmc.kaltura.com/index.php/kmc/support",
            "SIGNUP": "https://corp.kaltura.com/free-trial",
            "CONTACT_US": "https://corp.kaltura.com/company/contact-us",
            "HIGH_SPEED_UPLOAD": "http://site.kaltura.com/Upgrade_Request_High_Speed_Upload.html",
            "UPGRADE_ACCOUNT":"https://site.kaltura.com/Request-Users.html",
            "EMBED_HELP1": "http://www.kaltura.com/content/docs/NetHelp/default.htm#!Documents/embedcodetypes.htm",
            "EMBED_HELP2": "https://knowledge.kaltura.com/how-enforce-delivery-type-each-player-using-ui-variables",
            "BULK_UPLOAD_SAMPLES": "http://kmc.kaltura.com/content/docs/kaltura_batch_upload_falcon.zip"
        },
    }
};
