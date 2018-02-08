
import { environment } from '../environments/environment';

export interface GlobalConfig {
    client: {
        useSecuredProtocol: boolean,
        production: boolean,
        appVersion: string
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
        appVersion: '3.6.1',
        useSecuredProtocol: environment.client.useSecuredProtocol
    },
    kalturaServer: {
        useSecuredProtocol: environment.server.useSecuredProtocol,
        maxUploadFileSize: 2047, // Mb
        maxConcurrentUploads: 4,
        limitToPartnerId: null
    }
}
