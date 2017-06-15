import { Component } from '@angular/core';
import { AppStorage, AppLocalization } from '@kaltura-ng2/kaltura-common';
import { environment } from 'kmc-app';
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

  constructor(private appStorage: AppStorage, private appLocalization: AppLocalization) {
    this.languages = environment.core.locales;

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
    return R.find(R.propEq('id', langId))(environment.core.locales);
  }
}
