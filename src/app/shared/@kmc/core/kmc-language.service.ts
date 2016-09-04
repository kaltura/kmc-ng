import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { KMCConfig } from './kmc-config.service';
import { KMCBrowserService } from './kmc-browser.service';


import { Observable } from 'rxjs/rx';
import * as R from 'ramda';

@Injectable()
export class KMCLanguage {

    // private _initialized$ : ReplaySubject<boolean>;
    private dic: any;
    private currentLanguage: any = {};

    constructor(private http: Http, private kmcConfig: KMCConfig, private kmcBrowserService: KMCBrowserService) {
    }

    getDefaultLanguage() {
      let defaultLanguage = 'en_US';
      // try getting last selected language from local storage
      if (this.kmcBrowserService.getFromLocalStorage('kmc_lang') !== null) {
        let storedLanguage: string = this.kmcBrowserService.getFromLocalStorage('kmc_lang');
        if (this.getLanguageById(storedLanguage) !== undefined) {
          this.currentLanguage = this.getLanguageById(storedLanguage);
        }
      }

      // if wasn't found in local storage, try getting from browser language settings
      if (R.isEmpty(this.currentLanguage)) {
        let browserLanguage: string = navigator.language.split('-').join('_');
        if (this.getLanguageById(browserLanguage) !== undefined) {
          this.currentLanguage = this.getLanguageById(browserLanguage);
        }
      }

      // if browser language is not supported, use the defaulr en_US key
      if (R.isEmpty(this.currentLanguage)) {
        this.currentLanguage = this.getLanguageById(defaultLanguage);
      }

      if (this.currentLanguage && this.currentLanguage.id) {
        this.setLanguage(this.currentLanguage.id);
      } else {
        this.currentLanguage = {};
        console.log('Error getting default language');
      }
      return this.currentLanguage;
    }

    setLanguage(languageId) {
      this.kmcBrowserService.setInLocalStorage('kmc_lang', languageId);
      this.currentLanguage = this.getLanguageById(languageId);
      this.loadDictionary(this.currentLanguage.source).subscribe((dictionary) =>
        this.dic = dictionary
      , err => console.log(err));
      return this.currentLanguage;
    }

    getLanguageById(langId) {
      return R.find(R.propEq('id', langId))(this.kmcConfig.get('core.locales'));
    }

    loadDictionary(path) {
      return this.http.get(path)
        .map(function(data){
          return data.json();
        });
    }

    get(key) {
      return this.dic && this.dic[key] ? this.dic[key] : key;
    }

};
