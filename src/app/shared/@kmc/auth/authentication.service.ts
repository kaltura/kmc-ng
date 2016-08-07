import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { KalturaProxy } from '@kmc/kaltura-api';
import { UserContext } from './user-context'
import { IReadonlyUserContext } from './i-readonly-user-context';


@Injectable()
export class AuthenticationService {

    private _userContext : UserContext;

    constructor(public kalturaProxy : KalturaProxy){
        this._userContext = new UserContext();
    }

    get UserContext() : IReadonlyUserContext{
        return this._userContext;
    }

    login(username : string, password : string, rememberMe = false) : Observable<IReadonlyUserContext> {
        return this.kalturaProxy.user.loginByLoginId(username, password)
            .do((ks) => {
                this._userContext.ks = ks;
            }).map((ks) => {
                return this._userContext
            })
            .catch((err) => {
                console.log(err);
                return Observable.throw(err);
            });
    }

}