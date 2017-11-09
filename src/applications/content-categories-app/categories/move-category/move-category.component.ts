import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {KalturaCategory} from 'kaltura-typescript-client/types/KalturaCategory';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {CategoriesService, MoveCategoryData} from '../categories.service';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {CategoryData} from 'app-shared/content-shared/categories-search.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kMoveCategory',
  templateUrl: './move-category.component.html',
  styleUrls: ['./move-category.component.scss']
})
export class MoveCategoryComponent implements OnInit {

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() categoryToMove: KalturaCategory;
  @Output() onApply = new EventEmitter<MoveCategoryData>();


  public _isBusy = false;
  public _blockerMessage: AreaBlockerMessage = null;
  public _selectedParentCategory: CategoryData = null;

  constructor(  private _categoriesService: CategoriesService,
                private _appLocalization: AppLocalization) { }

  ngOnInit() {
    if (!this.categoryToMove) {
      console.warn('CategoryParentSelectorComponent: move category was selected without setting category Id to move');
    }
  }

  public _onCategorySelected(event: CategoryData) {
    this._selectedParentCategory = event;
  }

  public _apply(): void {
    this._isBusy = true;
    this._moveCategory(this._selectedParentCategory);
  }

  private _moveCategory(categoryParent: CategoryData) {
    if (this._validateCategoryMove(categoryParent)) {
      this.onApply.emit({category: this.categoryToMove, categoryParentId: categoryParent && categoryParent.id});
      if (this.parentPopupWidget) {
        this.parentPopupWidget.close();
      }
    }
  }

  private _validateCategoryMove(selectedCategoryParent: CategoryData) {
    // if category moved to the same parent or to 'no parent' as it was before
    if (!selectedCategoryParent && !this.categoryToMove.parentId ||
        selectedCategoryParent && this.categoryToMove.parentId === selectedCategoryParent.id) {
      this._blockerMessage = new AreaBlockerMessage({
        message: this._appLocalization.get('applications.content.moveCategory.errors.categoryAlreadyBelongsToParent'),
        buttons: [
          {
            label: this._appLocalization.get('app.common.cancel'),
            action: () => {
              this._isBusy = false;
              this._blockerMessage = null;
            }
          }
        ]
      });
      return false;
    } else if (selectedCategoryParent
        && !this._categoriesService
          .isParentCategorySelectionValid({category: this.categoryToMove, categoryParentId: selectedCategoryParent.id})) {
      // if trying to move category be a child of itself or one of its children show error message
      this._blockerMessage = new AreaBlockerMessage({
        message: this._appLocalization.get('applications.content.moveCategory.errors.invalidParentSelection'),
        buttons: [
          {
            label: this._appLocalization.get('app.common.cancel'),
            action: () => {
              this._isBusy = false;
              this._blockerMessage = null;
            }
          }
        ]
      });
      return false;
    }

    return true;
  }

  public _cancel(): void {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.close();
    }
  }
}
