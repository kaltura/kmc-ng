import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { AppMenuConfig } from '../../shared/app-menu-config';
import { AppMenuService } from '../../shared/app-menu.service';
import { AppMenuItem } from "../../shared/app-menu-config";
import { UploadComponent } from "../upload/upload.component";
import { UserSettingsComponent } from "../user-settings/user-settings.component";
import { LanguageMenuComponent } from "../language-menu/language-menu.component";
import { KMCLanguage } from "@kaltura/kmcng-core";

import * as R from 'ramda';


@Component({
  selector: 'kmc-app-menu',
  templateUrl: './app-menu.component.html',
  styleUrls: ['./app-menu.component.scss']
})
export class AppMenuComponent {

  private sub: any;
  selectedLanguage: any;

  constructor(private appMenuService : AppMenuService, private router : Router, private lang: KMCLanguage) {
    this.sub = router.events.subscribe((event) => {
      if(event instanceof NavigationEnd) {
        this.setSelectedRoute(event.url);
      }
    });
    this.selectedLanguage = this.lang.getDefaultLanguage();
  }

  menuConfig : AppMenuConfig;
  selectedMenuItem: AppMenuItem;
  showSubMenu: boolean = true;

  setSelectedRoute( path ){
    // close upload and language menu if currently open
    this.uploadOpen = false;
    this.langMenuOpen = false;

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
    this.langMenuOpen = false;
    this.uploadOpen = !this.uploadOpen;
  }

  // handle language window visibility and events
  langMenuOpen: boolean = false;
  toggleLanguage(){
    this.uploadOpen = false;
    this.langMenuOpen = !this.langMenuOpen;
  }
  onLanguageSelected(langId: string) {
    this.selectedLanguage = this.lang.setLanguage(langId);
    this.langMenuOpen = false; // close the language menu after selection
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
