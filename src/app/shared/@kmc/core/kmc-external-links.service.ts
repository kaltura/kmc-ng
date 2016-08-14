import { Injectable } from '@angular/core';
import * as R from 'ramda';

@Injectable()
export class KMCExternalLinks {

    constructor() {
    }

    openLink(baseUrl:string, params:any = {}, target: string = "_blank"){

      // if we got params, append to the base URL using query string
      if (baseUrl && baseUrl.length){
        if (Object.keys(params).length > 0){
          baseUrl += "?";
          for (var key of Object.keys(params)) {
            baseUrl += key + "=" + params[key] + "&";
          }
        }
        baseUrl = baseUrl.slice(0, - 1); // remove last &
      }
      window.open(baseUrl, target);
    }

};
