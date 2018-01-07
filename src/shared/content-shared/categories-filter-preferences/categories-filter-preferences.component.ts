import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CategoriesModes } from 'app-shared/content-shared/categories/categories-mode-type';

@Component({
  selector: 'kCategoriesFilterPrefs',
  templateUrl: './categories-filter-preferences.component.html',
  styleUrls: ['./categories-filter-preferences.component.scss']
})
export class CategoriesFilterPrefsComponent {

  @Input() selectionMode: CategoriesModes;
  @Output() selectionModeChange = new EventEmitter<CategoriesModes>();

  // expose enum to the template
  public _CategoriesModes = CategoriesModes;

  constructor() {
  }

  prefChange() {
    // use timeout to allow data binding to update showChildren before emitting the change event and saving to local storage
    setTimeout(() => {
      this.selectionModeChange.emit(this.selectionMode);
    }, 0);
  }
}

