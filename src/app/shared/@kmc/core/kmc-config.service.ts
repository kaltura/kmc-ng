import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as R from 'ramda';


function deepMerge(a, b) {
    return (R.is(Object, a) && R.is(Object, b)) ? R.mergeWith(deepMerge, a, b) : b;
}

function handleLoadError (error: any) {
    let errMsg = (error.message) ? error.message :
        error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
}
@Injectable()
export class KMCConfig {
    private config = {};
    constructor(private http: Http) {
    }

    private loadConfigFromServer() : Promise<any> {
        return new Promise((resolve,reject) =>
        {
            this.http.get('config/app.json')
                .map(res => res.json())
                .catch(handleLoadError)
                .subscribe(
                    (appData) => {
                        this.http.get(`config/${appData.env}.json`)
                            .map(res => res.json())
                            .catch(handleLoadError)
                            .subscribe(
                                (data) => {
                                    resolve(deepMerge(appData,data))
                                },
                                (error) => {
                                    reject(error);
                                }
                            );
                    },
                    (error) => {
                        reject(error);
                    }
                );
        });
    }
    public load() : Promise<any> {
        return new Promise((resolve, reject) => {
            this.loadConfigFromServer().then(config => {
                this.config = config;
                resolve(true);
            }).catch(function (error) {
                reject(error);
            });
        });
    }

    get(...keys : string[]) : any | any[] {

        const values = keys.map((key) =>
        {
            const keyToken = key.split('.');
            return R.path(keyToken,this.config);
        });

        return values.length === 1 ? values[0] : values;
    }
};