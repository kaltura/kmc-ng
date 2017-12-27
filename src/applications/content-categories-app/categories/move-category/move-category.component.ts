import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {CategoriesService} from '../categories.service';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {CategoryData} from 'app-shared/content-shared/categories-search.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {BrowserService} from 'app-shared/kmc-shell';
import {KalturaCategory} from 'kaltura-ngx-client/api/types/KalturaCategory';

@Component({
  selector: 'kMoveCategory',
  templateUrl: './move-category.component.html',
  styleUrls: ['./move-category.component.scss']
})
export class MoveCategoryComponent implements OnInit, OnDestroy {

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() selectedCategories: KalturaCategory[];
  @Output() onMovedCategories = new EventEmitter<null>();

  public _blockerMessage: AreaBlockerMessage = null;
  public _selectedParentCategory: CategoryData = null;

  constructor(private _categoriesService: CategoriesService,
              private _appLocalization: AppLocalization,
              private _browserService: BrowserService) {
  }

  ngOnInit() {
    if (!this.selectedCategories || !this.selectedCategories.length) {
      this._blockerMessage = new AreaBlockerMessage(
        {
          message: this._appLocalization.get('applications.content.moveCategory.errors.unableToMove'),
          buttons: [
            {
              label: this._appLocalization.get('app.common.cancel'),
              action: () => {
                this._blockerMessage = null;
                if (this.parentPopupWidget) {
                  this.parentPopupWidget.close();
                }
              }
            }
          ]
        });
      console.warn('CategoryParentSelectorComponent: move category was selected without setting category Id to move');
    }
  }

  ngOnDestroy() {
  }

  public _onCategorySelected(event: CategoryData) {
    this._selectedParentCategory = event;
  }

  public _apply(): void {
    const invalidCategory = this.selectedCategories.find((category) =>
      (!this._validateCategoryMove(category, this._selectedParentCategory))
    );
    if (!invalidCategory) {
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.categories.moveCategory'),
          message: this._appLocalization.get('applications.content.moveCategory.treeUpdateNotification'),
          accept: () => {
            this._blockerMessage = null;
            this._moveCategory(this._selectedParentCategory);
          }
        }
      );
    }
  }

  private _moveCategory(categoryParentData: CategoryData) {
    const categoryParent = categoryParentData ?
      {id: categoryParentData.id, fullIds: categoryParentData.fullIdPath} :
      {id: 0, fullIds: []};
    this._categoriesService
      .moveCategory({categories: this.selectedCategories, categoryParent})
      .tag('block-shell')
      .cancelOnDestroy(this)
      .subscribe(() => {
          this.onMovedCategories.emit();
          if (this.parentPopupWidget) {
            this.parentPopupWidget.close();
          }
        },
        error => {
          this._blockerMessage = new AreaBlockerMessage(
            {
              message: this._appLocalization.get('applications.content.moveCategory.errors.categoryMovedFailure'),
              buttons: [{
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._moveCategory(categoryParentData);
                }
              },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this._blockerMessage = null;
                  }
                }
              ]
            });
        });
  }

  private _validateCategoryMove(categoryToMove: KalturaCategory, selectedCategoryParent: CategoryData) {
    // if category moved to the same parent or to 'no parent' as it was before
    if (!selectedCategoryParent && !categoryToMove.parentId ||
      selectedCategoryParent && categoryToMove.parentId === selectedCategoryParent.id) {
      this._blockerMessage = new AreaBlockerMessage({
        message: this._appLocalization.get('applications.content.moveCategory.errors.categoryAlreadyBelongsToParent'),
        buttons: [
          {
            label: this._appLocalization.get('app.common.cancel'),
            action: () => {
              this._blockerMessage = null;
            }
          }
        ]
      });
      return false;
    } else if (selectedCategoryParent && !this._categoriesService.isParentCategorySelectionValid(
        {
          categories: this.selectedCategories,
          categoryParent: {id: selectedCategoryParent.id, fullIds: selectedCategoryParent.fullIdPath}
        })) {
      // if trying to move category be a child of itself or one of its children show error message
      this._blockerMessage = new AreaBlockerMessage({
        message: this._appLocalization.get('applications.content.moveCategory.errors.invalidParentSelection'),
        buttons: [
          {
            label: this._appLocalization.get('app.common.cancel'),
            action: () => {
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
