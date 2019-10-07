import {Component, EventEmitter, Input, OnDestroy, OnInit, AfterViewInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {PopupWidgetComponent, PopupWidgetStates} from '@kaltura-ng/kaltura-ui';
import {CategoriesService} from '../categories.service';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import {
  CategoriesStatus,
  CategoriesStatusMonitorService
} from 'app-shared/content-shared/categories-status/categories-status-monitor.service';
import { BrowserService } from 'app-shared/kmc-shell/providers';
import { SelectedCategory } from 'app-shared/content-shared/categories/category-selector/category-selector.component';
import { KalturaCategory } from 'kaltura-ngx-client';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { ContentEntriesMainViewService } from 'app-shared/kmc-shared/kmc-views';

@Component({
  selector: 'kNewCategory',
  templateUrl: './new-category.component.html',
  styleUrls: ['./new-category.component.scss'],
    providers: [KalturaLogger.createLogger('NewCategoryComponent')]
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
              private _logger: KalturaLogger,
              private _contentEntriesMainViewServie: ContentEntriesMainViewService,
              private _categoriesStatusMonitorService: CategoriesStatusMonitorService) {

    this.newCategoryForm = this._fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this._categoriesStatusMonitorService.status$
	    .pipe(cancelOnDestroy(this))
	    .subscribe((status: CategoriesStatus) => {
          this._categoriesUpdating = status.update;
        });
  }

  ngAfterViewInit() {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.state$
		  .pipe(cancelOnDestroy(this))
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
      this._logger.info(`handle parent category selected action by user`, { categoryId: event });
      this.newCategoryForm.markAsDirty();
    this._selectedParentCategory = event;
  }

  public _apply(): void {
      this._logger.info(`handle add new category action by user`);
    this._blockerMessage = null;
    if (this._selectedParentCategory !== 'missing') {
      this._createNewCategory();
    } else {
        this._logger.info(`no parent category was explicitly selected, abort action, show alert`);
      this._browserService.alert({
          header: this._appLocalization.get('app.common.attention'),
        message: this._appLocalization.get('applications.content.addNewCategory.errors.noParent')
      });
    }
  }

  private _createNewCategory() {
    const categoryName = this.newCategoryForm.controls['name'].value;

      this._logger.info(`handle create new category request`, { categoryName });
    if (!categoryName || !categoryName.length) {
        this._logger.info(`category name was not provided, show alert, abort action`);
      this._blockerMessage = new AreaBlockerMessage({
        message: this._appLocalization.get('applications.content.addNewCategory.errors.requiredName'),
        buttons: [
          {
            label: this._appLocalization.get('app.common.cancel'),
            action: () => {
                this._logger.info(`user dismissed alert`);
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
        .pipe(cancelOnDestroy(this))
        .pipe(tag('block-shell'))
        .subscribe(({category}) => {
            this._logger.info(`handle successful create category request`);
          this._showConfirmationOnClose = false;
            this.onApply.emit(category);
            if (this.parentPopupWidget) {
              this.parentPopupWidget.close();
            }
          },
          error => {
              this._logger.info(`handle failed create category request, show alert`, { errorMessage: error.message });
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
                        this._logger.info(`user dismissed alert`);
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
      this._logger.info(`handle cancel action by user`);
    if (this.parentPopupWidget) {
      this.parentPopupWidget.close();
    } else {
        this._logger.info(`no parentPopupWidget was provided, do nothing`);
    }

      if (this.linkedEntries.length) {
          this._logger.info(`linked entries provided, redirect to entries list`);
          this._contentEntriesMainViewServie.open();
      }
  }
}
