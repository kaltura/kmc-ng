import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { TranslateService, LangChangeEvent } from 'ng2-translate/ng2-translate';

import { AppConfig, AppStorage } from '@kaltura/kmcng-core';
import { AppMenuConfig } from '../../shared/app-menu-config';
import { AppMenuService } from '../../shared/app-menu.service';
import { AppMenuItem } from "../../shared/app-menu-config";
import { UploadComponent } from "../upload/upload.component";
import { UserSettingsComponent } from "../user-settings/user-settings.component";
import { LanguageMenuComponent } from "../language-menu/language-menu.component";

import * as R from 'ramda';


@Component({
  selector: 'kmc-app-menu',
  templateUrl: './app-menu.component.html',
  styleUrls: ['./app-menu.component.scss']
})
export class AppMenuComponent {

  private sub: any;
  selectedLanguage: any;

  constructor(private appMenuService : AppMenuService, private router : Router, private translate: TranslateService, private appConfig: AppConfig, private appStorage: AppStorage) {
    this.sub = router.events.subscribe((event) => {
      if(event instanceof NavigationEnd) {
        this.setSelectedRoute(event.url);
      }
    });

    if (typeof this.translate.currentLang !== "undefined"){
      this.selectedLanguage = this.getLanguageById(this.translate.currentLang);
    }
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.selectedLanguage = this.getLanguageById(event.lang);
    });
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
    this.translate.use(langId);
    this.appStorage.setInLocalStorage('kmc_lang', langId);
    this.langMenuOpen = false; // close the language menu after selection
  }

  private getLanguageById(langId : any) : any {
    return R.find(R.propEq('id', langId))(this.appConfig.get('core.locales'));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
