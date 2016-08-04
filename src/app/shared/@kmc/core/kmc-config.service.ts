import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import * as R from 'ramda'

@Injectable()
export class KMCConfig {
    private _config: {};
    constructor(private http: Http) {
    }
    public load() : any {
        return new Promise((resolve, reject) => {
            this.http.get('src/app/config/env.json')
            .map(res => res.json())
                .subscribe((env_data) => {
                    this.http.get(`src/app/config/${env_data.env}.json`)
                    .map(res => res.json())
                        .catch((error: any) => {
                            console.error(error);
                            return Observable.throw(error.json().error || 'Server error');
                        })
                        .subscribe((data) => {
                            Object.assign(this._config, env_data,data);
                            resolve(true);
                        });
                });
        });
    }

    get(key: any) : any {
        debugger;
        return R.path(key,this._config);
    }
};