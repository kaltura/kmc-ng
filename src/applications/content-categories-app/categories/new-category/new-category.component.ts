import {Component, EventEmitter, Input, OnDestroy, OnInit, AfterViewInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {PopupWidgetComponent, PopupWidgetStates} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {CategoriesService} from '../categories.service';

import {AppLocalization} from '@kaltura-ng/kaltura-common';

import {
  CategoriesStatus,
  CategoriesStatusMonitorService
} from 'app-shared/content-shared/categories-status/categories-status-monitor.service';
import { BrowserService } from 'app-shared/kmc-shell';
import { SelectedCategory } from 'app-shared/content-shared/categories/category-selector/category-selector.component';
import { KalturaCategory } from 'kaltura-ngx-client/api/types/KalturaCategory';

@Component({
  selector: 'kNewCategory',
  templateUrl: './new-category.component.html',
  styleUrls: ['./new-category.component.scss']
})
export class NewCategoryComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() linkedEntries: {entryId: string}[] = [];
  @Output() onApply = new EventEmitter<KalturaCategory>();

  public _blockerMessage: AreaBlockerMessage = null;
  public _selectedParentCategory: SelectedCategory = 'missing';
  public newCategoryForm: FormGroup;
  public _categoriesUpdating = false;

  private _showConfirmationOnClose = true;

  constructor(private _appLocalization: AppLocalization,
              private _fb: FormBuilder,
              private _categoriesService: CategoriesService,
              private _browserService: BrowserService,
              private _categoriesStatusMonitorService: CategoriesStatusMonitorService) {

    this.newCategoryForm = this._fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this._categoriesStatusMonitorService.status$
	    .cancelOnDestroy(this)
	    .subscribe((status: CategoriesStatus) => {
          this._categoriesUpdating = status.update;
        });
  }

  ngAfterViewInit() {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.state$
		  .cancelOnDestroy(this)
		  .subscribe(({ state, context }) => {
            if (state === PopupWidgetStates.Open) {
              this._showConfirmationOnClose = true;
            }
            if (state === PopupWidgetStates.BeforeClose
                && context && context.allowClose && this.newCategoryForm.dirty
                && this._showConfirmationOnClose) {
              context.allowClose = false;
              this._browserService.confirm(
                  {
                    header: this._appLocalization.get('applications.content.addNewPlaylist.cancelEdit'),
                    message: this._appLocalization.get('applications.content.addNewPlaylist.discard'),
                    accept: () => {
                      this._showConfirmationOnClose = false;
                      this.parentPopupWidget.close();
                    }
                  }
              );
            }
          });
    }
  }

  ngOnDestroy() {
  }

  public _onCategorySelected(event: number) {
      this.newCategoryForm.markAsDirty();
    this._selectedParentCategory = event;
  }

  public _apply(): void {
    this._blockerMessage = null;
    if (this._selectedParentCategory !== 'missing') {
      this._createNewCategory();
    } else {
      this._browserService.alert({
          header: this._appLocalization.get('app.common.attention'),
        message: this._appLocalization.get('applications.content.addNewCategory.errors.noParent')
      });
    }
  }

  private _createNewCategory() {
    const categoryName = this.newCategoryForm.controls['name'].value;
    if (!categoryName || !categoryName.length) {
      this._blockerMessage = new AreaBlockerMessage({
        message: this._appLocalization.get('applications.content.addNewCategory.errors.requiredName'),
        buttons: [
          {
            label: this._appLocalization.get('app.common.cancel'),
            action: () => {
              this._blockerMessage = null;
            }
          }
        ]
      });
    } else {
      this._categoriesService
        .addNewCategory({
          categoryParentId: this._selectedParentCategory !== 'missing' ? this._selectedParentCategory : null,
          name: categoryName,
          linkedEntriesIds: this.linkedEntries.map(entry => entry.entryId)
        })
        .cancelOnDestroy(this)
        .tag('block-shell')
        .subscribe(({category}) => {
          this._showConfirmationOnClose = false;
            this.onApply.emit(category);
            if (this.parentPopupWidget) {
              this.parentPopupWidget.close();
            }
          },
          error => {
            let message = '';
            let navigateToCategory = false;
            switch (error.code)
            {
                case 'category_creation_failure':
                    message = this._appLocalization.get('applications.content.addNewCategory.errors.createFailed');
                    break;
                case 'missing_category_name':
                    message = this._appLocalization.get('applications.content.addNewCategory.errors.requiredName');
                    break;
                case 'entries_link_issue':
                    message = this._appLocalization.get('applications.content.addNewCategory.errors.cannotLinkEntries');
                    navigateToCategory = true;
                    break;
                case 'duplicate_category':
                    message = this._appLocalization.get(
                        'applications.content.moveCategory.errors.duplicatedName',
                        [categoryName]
                    );
                    break;
                default:
                    message = error.message;
                    break;
            }

            this._blockerMessage = new AreaBlockerMessage(
              {
                message: message,
                buttons: [
                  {
                    label: this._appLocalization.get('app.common.ok'),
                    action: () => {
                      this._blockerMessage = null;
                        if (navigateToCategory) {
                            this._showConfirmationOnClose = false;
                            if (error.context && error.context.categoryId) {
                                const category = new KalturaCategory();
                                (<any>category).id = error.context.categoryId;
                                this.onApply.emit(category);
                            }
                            if (this.parentPopupWidget) {
                                this.parentPopupWidget.close();
                            }
                        }
                    }
                  }
                ]
              });
          });
    }
  }

  public _cancel(): void {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.close();
    }
  }
}
