import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CategoriesSeclectionModes } from 'app-shared/content-shared/categories-filter/categories-filter.component';

@Component({
  selector: 'kCategoriesFilterPrefs',
  templateUrl: './categories-filter-preferences.component.html',
  styleUrls: ['./categories-filter-preferences.component.scss']
})
export class CategoriesFilterPrefsComponent {

  @Input() selectionMode: CategoriesSeclectionModes;
  @Output() selectionModeChange: EventEmitter<CategoriesSeclectionModes> = new EventEmitter<CategoriesSeclectionModes>();

  // expose enum to the template
  public _CategoriesSeclectionModes = CategoriesSeclectionModes;

  constructor() {
  }

  prefChange() {
    // use timeout to allow data binding to update showChildren before emitting the change event and saving to local storage
    setTimeout(() => {
      this.selectionModeChange.emit(this.selectionMode);
    }, 0);
  }
}

