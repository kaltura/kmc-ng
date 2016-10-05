import { Injectable } from '@angular/core';
import {LocalStorageService, SessionStorageService} from 'ng2-webstorage';
import { IAppStorage } from '@kaltura-ng2/kaltura-core';


@Injectable()
export class BrowserService implements IAppStorage {

  constructor(private localStorage :LocalStorageService, private sessionStorage : SessionStorageService )
  {}

  public setInLocalStorage(key : string, value : any) : void{
   this.localStorage.store(key,value);
  }

  public getFromLocalStorage(key : string) : any{
    return this.localStorage.retrieve(key);
  }

  public removeFromLocalStorage(key : string) : any{
    this.localStorage.clear(key);
  }

  public setInSessionStorage(key : string, value : any) : void{
    this.sessionStorage.store(key,value);
  }

  public getFromSessionStorage(key : string) : any{
    return this.sessionStorage.retrieve(key);
  }

  public removeFromSessionStorage(key : string) : any{
    this.sessionStorage.clear(key);
  }

  public openLink(baseUrl:string, params:any = {}, target: string = "_blank"){
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
}
