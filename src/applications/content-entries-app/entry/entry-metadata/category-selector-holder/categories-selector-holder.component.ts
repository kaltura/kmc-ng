import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {
  CategoriesSelectorComponent,
  CategorySelectionMode,
  EntryCategoryItem
} from 'app-shared/content-shared/category-selector/categories-selector.component';


@Component({
  selector: 'kCategoriesSelectorHolder',
  templateUrl: './categories-selector-holder.component.html',
  styleUrls: ['./categories-selector-holder.component.scss']
})
export class CategoriesSelectorHolderComponent {
  @Input() buttonLabel = '';
  @Input() set value(value: EntryCategoryItem[]) {
    this._selectedCategories = value || [];
  }
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Output() valueChange = new EventEmitter<EntryCategoryItem[]>();

  @ViewChild('categoriesSelector') _categoriesSelector: CategoriesSelectorComponent;

  public _selectedCategories: EntryCategoryItem[] = [];
  public _categoriesSelectionMode = CategorySelectionMode.multi;

  public _apply(): void {
    this.valueChange.emit(this._selectedCategories);

    if (this.parentPopupWidget) {
      this.parentPopupWidget.close({ isDirty: true });
    }
  }

  public _removeTag(tag: EntryCategoryItem): void {
    this._categoriesSelector.removeSelection(tag);
  }

  public _removeAllTag(): void {
    this._categoriesSelector.clearSelection();
  }

  public _selectionUpdated(categories: EntryCategoryItem[]): void {
    this._selectedCategories = categories;
  }
}
