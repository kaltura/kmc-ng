import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { CategoriesService } from '../categories.service';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { BrowserService } from 'app-shared/kmc-shell';
import { KalturaCategory } from 'kaltura-ngx-client/api/types/KalturaCategory';
import {
  CategoriesStatus,
  CategoriesStatusMonitorService
} from 'app-shared/content-shared/categories-status/categories-status-monitor.service';
import { SelectedCategory } from 'app-shared/content-shared/categories/category-selector/category-selector.component';
import { Observable } from 'rxjs/Observable';
import { CategoriesGraphUpdatedEvent } from 'app-shared/kmc-shared/app-events/categories-graph-updated/categories-graph-updated';
import { AppEventsService } from 'app-shared/kmc-shared';

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
  public _selectedParentCategory: SelectedCategory = 'missing';
  public _categoriesUpdating = false;

  constructor(private _categoriesService: CategoriesService,
              private _appEvents: AppEventsService,
              private _appLocalization: AppLocalization,
              private _browserService: BrowserService,
              private _categoriesStatusMonitorService: CategoriesStatusMonitorService) {
  }

  ngOnInit() {
    this._categoriesStatusMonitorService.status$
	    .cancelOnDestroy(this)
	    .subscribe((status: CategoriesStatus) => {
          this._categoriesUpdating = status.update;
        });

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

  public _onCategorySelected(event: number) {
    this._selectedParentCategory = event;
  }

  public _apply(): void {
    if (this._selectedParentCategory === 'missing') {
      this._browserService.alert({
        header: this._appLocalization.get('app.common.attention'),
        message: this._appLocalization.get('applications.content.moveCategory.noCategorySelected')
      });
      return;
    }

    Observable.from(this.selectedCategories)
      .switchMap(category => this._validateCategoryMove(category))
      .toArray()
      .subscribe(
        validatedCategories => {
          const allValid = validatedCategories.every(Boolean);
          if (allValid) {
            this._browserService.confirm({
              header: this._appLocalization.get('applications.content.categories.moveCategory'),
              message: this._appLocalization.get('applications.content.moveCategory.treeUpdateNotification'),
              accept: () => {
                this._blockerMessage = null;
                this._moveCategory();
              }
            });
          }
        },
        error => {
          this._browserService.confirm({
            header: this._appLocalization.get('app.common.error'),
            message: error.message || this._appLocalization.get('applications.content.moveCategory.errors.failedToLoadParentCategoryData'),
            accept: () => {
              this._blockerMessage = null;
            }
          });
        });
  }

  private _getCategoryParentData(): Observable<{ id?: number, fullIds: number[] }> {
    return Observable.create(observer => {
      const hasSelectedParent = this._selectedParentCategory && this._selectedParentCategory !== 'missing';

      if (!hasSelectedParent) {
        observer.next({ id: 0, fullIds: [] });
        observer.complete();
        return;
      }

      this._categoriesService.getCategoryById(<number>this._selectedParentCategory)
        .subscribe(
          category => {
            observer.next({ id: category.id, fullIds: category.fullIdPath });
            observer.complete();
          },
          error => {
            observer.error(error);
          });
    });
  }

  private _moveCategory() {
    this._getCategoryParentData()
      .switchMap(categoryParent => this._categoriesService.moveCategory({ categories: this.selectedCategories, categoryParent }))
      .tag('block-shell')
      .cancelOnDestroy(this)
      .subscribe(() => {
          this.onMovedCategories.emit();
          this._appEvents.publish(new CategoriesGraphUpdatedEvent());
          this._categoriesStatusMonitorService.updateCategoriesStatus();
          this._categoriesService.reload();
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
    if (this._selectedParentCategory === 'missing') {
      return Observable.of(false);
    }

    // if category moved to the same parent or to 'no parent' as it was before
    const sameParent = categoryToMove.parentId === this._selectedParentCategory || (!categoryToMove.parentId && this._selectedParentCategory === null);
    if (sameParent) {
      this._blockerMessage = new AreaBlockerMessage({
        message: this._appLocalization.get('applications.content.moveCategory.errors.categoryAlreadyBelongsToParent'),
        buttons: [{
          label: this._appLocalization.get('app.common.cancel'),
          action: () => {
            this._blockerMessage = null;
          }
        }]
      });
      return Observable.of(false);
    }

    if (this._selectedParentCategory === null) { // no parent selected
      return Observable.of(true);
    }

    return this._categoriesService.getCategoryById(<number>this._selectedParentCategory)
      .map(selectedParent => {
        return this._categoriesService.isParentCategorySelectionValid(
          {
            categories: this.selectedCategories,
            categoryParent: { id: selectedParent.id, fullIds: selectedParent.fullIdPath }
          });
      })
      .do(isParentCategorySelectionValid => {
        if (!isParentCategorySelectionValid) {
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
        }
      });
  }


  public _cancel(): void {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.close();
    }
  }
}
