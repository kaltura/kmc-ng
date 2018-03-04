
import { environment } from '../environments/environment';
import { countryCodes } from './country-codes';

export interface GlobalConfig {
    client: {
        useSecuredProtocol: boolean,
        production: boolean,
        appVersion: string,
        countriesList: string[]
    },
    kalturaServer: {
        useSecuredProtocol: boolean,
        maxUploadFileSize: number,
        maxConcurrentUploads: number,
        limitToPartnerId: number | null
    }
}

export const globalConfig: GlobalConfig = {
    client: {
        production: environment.production,
        appVersion: '3.7.0',
        useSecuredProtocol: environment.client.useSecuredProtocol,
        countriesList: countryCodes
    },
    kalturaServer: {
        useSecuredProtocol: environment.server.useSecuredProtocol,
        maxUploadFileSize: 2047, // Mb
        maxConcurrentUploads: 4,
        limitToPartnerId: null
    }
}
