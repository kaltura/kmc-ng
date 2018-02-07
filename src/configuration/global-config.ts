
import { environment } from '../environments/environment';

export interface GlobalConfig {
    useSecuredProtocol: boolean,
    production: boolean,
    appVersion: string,
    server: {
        useSecuredProtocol: boolean,
        maxUploadFileSize: number,
        maxConcurrentUploads: number,
        limitToPartnerId: number | null
    }
}

export const globalConfig: GlobalConfig = {
    production: environment.production,
    appVersion: '3.6.1',
    useSecuredProtocol: environment.client.useSecuredProtocol,
    server: {
        useSecuredProtocol: environment.server.useSecuredProtocol,
        maxUploadFileSize: 2047, // Mb
        maxConcurrentUploads: 4,
        limitToPartnerId: null
    }
}
