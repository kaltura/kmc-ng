import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {CategoriesService} from '../categories.service';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {BrowserService} from 'app-shared/kmc-shell';
import {KalturaCategory} from 'kaltura-ngx-client/api/types/KalturaCategory';
import { CategoriesListItem } from 'app-shared/content-shared/categories/categories-list-type';
import {
  CategoriesStatus,
  CategoriesStatusMonitorService
} from 'app-shared/content-shared/categories-status/categories-status-monitor.service';

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
  public _selectedParentCategory: CategoriesListItem = null;
  public _categoriesUpdating = false;

  constructor(private _categoriesService: CategoriesService,
              private _appLocalization: AppLocalization,
              private _browserService: BrowserService,
              private _categoriesStatusMonitorService: CategoriesStatusMonitorService) {

    this._categoriesStatusMonitorService.$categoriesStatus
	    .cancelOnDestroy(this)
	    .subscribe((status: CategoriesStatus) => {
          this._categoriesUpdating = status.update;
        });
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

  public _onCategorySelected(event: CategoriesListItem) {
    this._selectedParentCategory = event;
  }

  public _apply(): void {
    const invalidCategory = this.selectedCategories.find((category) =>
      (!this._validateCategoryMove(category))
    );
    if (!invalidCategory) {
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.categories.moveCategory'),
          message: this._appLocalization.get('applications.content.moveCategory.treeUpdateNotification'),
          accept: () => {
            this._blockerMessage = null;
            this._moveCategory();
          }
        }
      );
    }
  }

  private _moveCategory() {
    const categoryParent = this._selectedParentCategory ?
      {id: this._selectedParentCategory.value, fullIds: this._selectedParentCategory.fullIdPath} :
      {id: 0, fullIds: []};
    this._categoriesService
      .moveCategory({categories: this.selectedCategories, categoryParent})
      .tag('block-shell')
      .cancelOnDestroy(this)
      .subscribe(() => {
          this.onMovedCategories.emit();
          this._categoriesStatusMonitorService.updateCategoriesStatus();
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
                  this._moveCategory();
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

  private _validateCategoryMove(categoryToMove: KalturaCategory) {
    // if category moved to the same parent or to 'no parent' as it was before
    if ((!this._selectedParentCategory && !categoryToMove.parentId) ||
        (this._selectedParentCategory && categoryToMove.parentId === this._selectedParentCategory.value)) {
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
    } else if (this._selectedParentCategory && !this._categoriesService.isParentCategorySelectionValid(
        {
          categories: this.selectedCategories,
          categoryParent: {id: this._selectedParentCategory.value, fullIds: this._selectedParentCategory.fullIdPath}
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
