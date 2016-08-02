import { Injectable } from '@angular/core';

import { AppMenuConfig } from './app-menu-config'

const StaticMenuConfig : AppMenuConfig = [
  {routePath : 'dashboard', titleToken : 'Dashboard'},
  {routePath : 'content', titleToken : 'Content', children : [
    {routePath : 'entries', titleToken : 'Entries'}
  ]},
  {routePath : 'studio', titleToken : 'Studio'},
  {routePath : '', titleToken : 'Analytics'},
  {routePath : '', titleToken : 'Settings'},
  {routePath : '', titleToken : 'Administration'},
];

@Injectable()
export class AppMenuService {

  constructor() {}

  getMenuConfig() : Promise<AppMenuConfig> {
    return new Promise(function (resolve,reject){
      resolve(StaticMenuConfig);
    });

  }


}
