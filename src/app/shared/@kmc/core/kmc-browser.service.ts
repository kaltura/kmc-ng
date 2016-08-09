import { Injectable } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs/rx';
import { Locker } from 'angular2-locker';
import {KMCConfig} from "./kmc-config.service";

@Injectable()
export class KMCBrowserService {

  constructor(private kmcConfig : KMCConfig, private locker : Locker)
  {
    this._areaHeight$ = <ReplaySubject<number>>new ReplaySubject(1); // we are using here a replay subject with buffer of 1 so any new subsribers will get the last one.

    locker.setNamespace(<string>kmcConfig.get('shell.browser.storageNamespace'));
  }

  private _areaHeight$ : ReplaySubject<number>;

  public getContentAreaHeight() : Observable<number>{
    return this._areaHeight$.asObservable(); // we proxy the subject by a function that returns its observable to prevent others from broadcasting on that subject.
  }

  public setContentAreaHeight(value : number) : void {
    this._areaHeight$.next(value);
  };

  public setInLocalStorage(key : string, value : any) : void{
    var driver = this.locker.useDriver(Locker.DRIVERS.LOCAL);
    driver.set(key,value);
  }

  public getFromLocalStorage(key : string) : any{
    var driver = this.locker.useDriver(Locker.DRIVERS.LOCAL);
    return driver.get(key);
  }

  public removeFromLocalStorage(key : string) : any{
    var driver = this.locker.useDriver(Locker.DRIVERS.LOCAL);
    return driver.remove(key);
  }

  public setInSessionStorage(key : string, value : any) : void{
    var driver = this.locker.useDriver(Locker.DRIVERS.SESSION);
    driver.set(key,value);
  }

  public getFromSessionStorage(key : string) : any{
    var driver = this.locker.useDriver(Locker.DRIVERS.SESSION);
    return driver.get(key);
  }

  public removeFromSessionStorage(key : string) : any{
    var driver = this.locker.useDriver(Locker.DRIVERS.SESSION);
    return driver.remove(key);
  }

}
