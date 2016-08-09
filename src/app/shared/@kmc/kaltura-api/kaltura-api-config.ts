export class KalturaAPIConfig {
    ks : string;
    apiUrl : string;
    apiVersion : string;

    clientTag = '@kaltura-ng2/kapi_v1_0_0';
    headers = {
        'Accept' : 'application/json',
        'Content-Type' : 'application/json'
    };
    format = 1;

}