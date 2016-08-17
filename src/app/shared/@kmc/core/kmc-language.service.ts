import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { KMCConfig } from "./kmc-config.service";
import { KMCBrowserService } from "./kmc-browser.service";


import { ReplaySubject, Observable } from 'rxjs/rx';
import * as R from 'ramda';

function handleLoadError (error: any) {
    let errMsg = (error.message) ? error.message :
        error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
}

@Injectable()
export class KMCLanguage {

    //private _initialized$ : ReplaySubject<boolean>;
    public dic: any = {};
    private currentLanguage: any = {};

    constructor(private http: Http, private kmcConfig: KMCConfig, private kmcBrowserService: KMCBrowserService) {
    }

    getDefaultLanguage(){
      let defaultLanguage = "en_US";
      // try getting last selected language from local storage
      if (this.kmcBrowserService.getFromLocalStorage("kmc_lang") !== null){
        let storedLanguage: string = this.kmcBrowserService.getFromLocalStorage("kmc_lang");
        if (this.getLanguageById(storedLanguage) !== undefined){
          this.currentLanguage = this.getLanguageById(storedLanguage);
        }
      }

      // if wasn't found in local storage, try getting from browser language settings
      if (R.isEmpty(this.currentLanguage)){
        let browserLanguage: string = navigator.language.split("-").join("_");
        if (this.getLanguageById(browserLanguage) !== undefined){
          this.currentLanguage = this.getLanguageById(browserLanguage);
        }
      }

      // if browser language is not supported, use the defaulr en_US key
      if (R.isEmpty(this.currentLanguage)) {
        this.currentLanguage = this.getLanguageById(defaultLanguage);
      }

      if (this.currentLanguage && this.currentLanguage.id){
        this.setLanguage(this.currentLanguage.id);
      }else{
        this.currentLanguage = {};
        console.log("Error getting default language");
      }
      return this.currentLanguage;
    }

    setLanguage(languageId){
      this.kmcBrowserService.setInLocalStorage("kmc_lang", languageId);
      this.currentLanguage = this.getLanguageById(languageId);
      this.loadDictionary(this.currentLanguage.source).subscribe(function(dictionary){
        this.dic = dictionary;
      }, err => console.log(err));
      return this.currentLanguage;
    }

    getLanguageById(langId){
      return R.find(R.propEq('id', langId))(this.kmcConfig.get("core.locales"));
    }

    loadDictionary(path){
      return this.http.get(path)
        .map(function(data){
          return data.json();
        });
    }
    //
    //public onRefresh() : Observable<boolean>{
    //    return this._initialized$.asObservable(); // we proxy the subject by a function that returns its observable to prevent others from broadcasting on that subject.
    //}
    //
    //private loadConfigFromServer() : Promise<any> {
    //    return new Promise((resolve,reject) =>
    //    {
    //        this.http.get('config/app.json')
    //            .map(res => res.json())
    //            .catch(handleLoadError)
    //            .subscribe(
    //                (appData) => {
    //                    this.http.get(`config/${appData.env}.json`)
    //                        .map(res => res.json())
    //                        .catch(handleLoadError)
    //                        .subscribe(
    //                            (data) => {
    //                                resolve(deepMerge(appData,data))
    //                            },
    //                            (error) => {
    //                                reject(error);
    //                            }
    //                        );
    //                },
    //                (error) => {
    //                    reject(error);
    //                }
    //            );
    //    });
    //}
    //public load() : Promise<any> {
    //    return new Promise((resolve, reject) => {
    //        this.loadConfigFromServer().then(config => {
    //            this.config = config;
    //            this._initialized$.next(true);
    //            resolve(true);
    //        }).catch(function (error) {
    //            reject(error);
    //        });
    //    });
    //}
};
