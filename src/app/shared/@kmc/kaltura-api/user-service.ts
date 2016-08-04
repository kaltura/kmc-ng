import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/observable';
import { Http, URLSearchParams } from '@angular/http';
import { KMCConfig } from '@kmc/core';


@Injectable()
export class UserService {
    constructor(private http : Http, private kmcConfig : KMCConfig){

    }

    loginByLoginId(loginId :string, password : string , expiry? : number, privileges? : string) : Observable<string>
    {
        const [ apiUrl, format = 1] = this.kmcConfig.get('core.kaltura.apiUrl', 'core.kaltura.format');

        const searchParams: URLSearchParams = new URLSearchParams();
        searchParams.set('format', '' + format);
        searchParams.set('service', 'user');
        searchParams.set('action', 'loginByLoginId');
        searchParams.set('loginId', loginId);
        searchParams.set('password', password);
        if (expiry) {
            searchParams.set('expiry', ''+expiry);
        }

        if (privileges) {
            searchParams.set('privileges', privileges);
        }

        return this.http.post(apiUrl, { search : searchParams})
            .map(result => result.json());
    }
}