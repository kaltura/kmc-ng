import { Component } from '@angular/core';
import { AppConfig, AppStorage, AppLocalization } from '@kaltura-ng2/kaltura-common';

import * as R from 'ramda';

@Component({
  selector: 'kKMCLanguageMenu',
  templateUrl: './language-menu.component.html',
  styleUrls: ['./language-menu.component.scss']
})
export class LanguageMenuComponent {

  selectedLanguage: any;
  menuOpened: boolean = false;
  languages: Array<Object> = [];

  constructor(private kmcConfig: AppConfig, private appStorage: AppStorage, private appConfig: AppConfig, private appLocalization: AppLocalization) {
    this.languages = kmcConfig.get("core.locales");

    if (typeof this.appLocalization.selectedLanguage !== "undefined"){
      this.selectedLanguage = this.getLanguageById(this.appLocalization.selectedLanguage);
    }
    // this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    //   this.selectedLanguage = this.getLanguageById(event.lang);
    // });
  }

  toggleMenu() {
    this.menuOpened = !this.menuOpened;
  }

  selectLanguage(langId: string) {
    this.menuOpened = false;
    this.appStorage.setInLocalStorage('kmc_lang', langId);
    location.reload();
  }

  private getLanguageById(langId : any) : any {
    return R.find(R.propEq('id', langId))(this.appConfig.get('core.locales'));
  }
}
