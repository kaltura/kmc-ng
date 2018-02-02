import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {CategoriesService} from '../categories.service';

import {AppLocalization} from '@kaltura-ng/kaltura-common';

import {
  CategoriesStatus,
  CategoriesStatusMonitorService
} from 'app-shared/content-shared/categories-status/categories-status-monitor.service';

@Component({
  selector: 'kNewCategory',
  templateUrl: './new-category.component.html',
  styleUrls: ['./new-category.component.scss']
})
export class NewCategoryComponent implements OnInit, OnDestroy {

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() linkedEntries: {entryId: string}[] = [];
  @Output() onApply = new EventEmitter<{ categoryId: number }>();

  public _blockerMessage: AreaBlockerMessage = null;
  public _selectedParentCategory: number = null;
  public newCategoryForm: FormGroup;
  public _categoriesUpdating = false;
  public _nameEmptyError = false;

  constructor(private _appLocalization: AppLocalization,
              private _fb: FormBuilder,
              private _categoriesService: CategoriesService,
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

  ngOnDestroy() {
  }

  public _onCategorySelected(event: number) {
    this._selectedParentCategory = event;
  }

  public _apply(): void {
    this._blockerMessage = null;
    this._createNewCategory();
  }

  private _createNewCategory() {
    const categoryName = (this.newCategoryForm.controls['name'].value || '').trim();
    if (!categoryName || !categoryName.length) {
      this._nameEmptyError = true;
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
          categoryParentId: this._selectedParentCategory ? this._selectedParentCategory : null,
          name: categoryName,
          linkedEntriesIds: this.linkedEntries.map(entry => entry.entryId)
        })
        .cancelOnDestroy(this)
        .tag('block-shell')
        .subscribe(({category}) => {
            this.onApply.emit({categoryId: category.id});
            this._blockerMessage = null;
            if (this.parentPopupWidget) {
              this.parentPopupWidget.close();
            }
          },
          error => {
            this._blockerMessage = new AreaBlockerMessage(
              {
                message: error.message || this._appLocalization.get('applications.content.addNewCategory.errors.createFailed'),
                buttons: [{
                    label: this._appLocalization.get('app.common.ok'),
                    action: () => {
                      this._blockerMessage = null;
                      if (error.code === 'MAX_CATEGORIES_FOR_ENTRY_REACHED') {
                        this.onApply.emit({ categoryId: error.args.categoryId });
                        if (this.parentPopupWidget) {
                          this.parentPopupWidget.close();
                        }
                      }
                    }
                  }]
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
