import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { AppConfig, AppStorage } from '@kaltura-ng2/kaltura-common';
import { AppMenuConfig } from '../../services/app-menu-config';
import { AppMenuService } from '../../services/app-menu.service';
import { AppMenuItem } from "../../services/app-menu-config";

import * as R from 'ramda';


@Component({
  selector: 'kmc-app-menu',
  templateUrl: './app-menu.component.html',
  styleUrls: ['./app-menu.component.scss']
})
export class AppMenuComponent {

  private sub: any;

  constructor(private appMenuService : AppMenuService, private router : Router) {
    this.sub = router.events.subscribe((event) => {
      if(event instanceof NavigationEnd) {
        this.setSelectedRoute(event.url);
      }
    });

  }

  menuConfig : AppMenuConfig;
  selectedMenuItem: AppMenuItem;
  showSubMenu: boolean = true;

  setSelectedRoute( path ){
    // close upload and language menu if currently open
    this.uploadOpen = false;

    this.menuConfig = this.appMenuService.getMenuConfig();
    let item = R.find(R.propEq('routePath', path.split("/")[1]))(this.menuConfig);
    if ( item ) {
      this.selectedMenuItem = item;
      this.showSubMenu = item.showSubMenu !== undefined ? item.showSubMenu : true;
    }
  }

  // handle upload window visibility
  uploadOpen: boolean = false;
  toggleUpload(){
    this.uploadOpen = !this.uploadOpen;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
