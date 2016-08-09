import { Component, OnInit } from '@angular/core';
import { ROUTER_DIRECTIVES, Router } from '@angular/router';

import { AppMenuConfig } from '../../shared/app-menu-config';
import { AppMenuService } from '../../shared/app-menu.service';
import { AppMenuItem } from "../../shared/app-menu-config";

import * as R from 'ramda';

@Component({
  selector: 'kmc-app-menu',
  templateUrl: './app-menu.component.html',
  styleUrls: ['./app-menu.component.scss'],
  directives: [ROUTER_DIRECTIVES]
})
export class AppMenuComponent implements OnInit {

  constructor(private appMenuService : AppMenuService, private router : Router) {

  }

  menuConfig : AppMenuConfig;
  selectedMenuItem: AppMenuItem;
  showSubMenu: boolean = true;

  selectItem(item, isSubMenu) : void{
    // The navigation is done by url since the menu config is not aware to the internal hierarchy
    if ( !isSubMenu ) {
      this.selectedMenuItem = item;
      this.showSubMenu = item.showSubMenu !== undefined ? item.showSubMenu : true;
    }
    //this.router.navigateByUrl(item.routePath);
  }

  ngOnInit() {
    // TODO [kmc] [amir] subscribe to router changes, unsubscribe on destroy and move logic to change event. remove selectItem.
    this.menuConfig = this.appMenuService.getMenuConfig();
    let path = this.router.url.substr(1).split("/")[0];
    let item = R.find(R.propEq('routePath', path))(this.menuConfig);
    if (item) {
      this.selectedMenuItem = item;
      this.showSubMenu = item.showSubMenu !== undefined ? item.showSubMenu : true;
    }
  }

}
