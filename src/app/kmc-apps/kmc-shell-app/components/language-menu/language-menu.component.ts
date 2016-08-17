import { Component, Input, Output, EventEmitter } from '@angular/core';

import { KMCConfig } from "../../../../shared/@kmc/core/kmc-config.service";
import { KMCLanguage } from "../../../../shared/@kmc/core/kmc-language.service";

@Component({
  selector: 'kmc-language-menu',
  templateUrl: './language-menu.component.html',
  styleUrls: ['./language-menu.component.scss']
})
export class LanguageMenuComponent {
  @Input() langMenuOpen: boolean;
  @Output() onLanguageSelected = new EventEmitter<string>();

  languages: Array<Object> = [];

  constructor(private kmcConfig: KMCConfig, private lang: KMCLanguage) {
    this.languages = kmcConfig.get("core.locales");
  }

  selectLanguage(langId){
    this.onLanguageSelected.emit(langId);
  }
}
