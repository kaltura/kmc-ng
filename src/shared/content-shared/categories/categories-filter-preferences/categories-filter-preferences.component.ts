import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CategoriesModes} from 'app-shared/content-shared/categories/categories-mode-type';
import {AppLocalization} from '@kaltura-ng/kaltura-common';

export enum TranslationsContext {
  Categories,
  Entries
}

@Component({
  selector: 'kCategoriesFilterPrefs',
  templateUrl: './categories-filter-preferences.component.html',
  styleUrls: ['./categories-filter-preferences.component.scss']
})
export class CategoriesFilterPrefsComponent implements OnInit {

  @Input() selectionMode: CategoriesModes;
  @Output() selectionModeChange = new EventEmitter<CategoriesModes>();
  @Input() translationsContext: TranslationsContext = TranslationsContext.Entries;

  // expose enum to the template
  public _CategoriesModes = CategoriesModes;
  public _categoriesFilterPrefLabels: {[key: number]: string};

  constructor(private _appLocalization: AppLocalization) {
  }

  prefChange() {
    // use timeout to allow data binding to update showChildren before emitting the change event and saving to local storage
    setTimeout(() => {
      this.selectionModeChange.emit(this.selectionMode);
    }, 0);
  }

  public ngOnInit() {
    if (this.translationsContext === TranslationsContext.Categories) {
      this._categoriesFilterPrefLabels = {
        [CategoriesModes.Self]: this._appLocalization.get('applications.content.categories.filterCategoriesPrefOptions.self'),
        [CategoriesModes.SelfAndChildren]: this._appLocalization
          .get('applications.content.categories.filterCategoriesPrefOptions.selfAndChildren')
      };
    } else {
      this._categoriesFilterPrefLabels = {
        [CategoriesModes.Self]: this._appLocalization.get('applications.content.filters.preferences.selectedOnly'),
        [CategoriesModes.SelfAndChildren]: this._appLocalization.get('applications.content.filters.preferences.subSelected')
      };
    }
  }
}

