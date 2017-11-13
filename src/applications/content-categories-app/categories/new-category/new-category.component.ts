import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {KalturaCategory} from 'kaltura-typescript-client/types/KalturaCategory';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {CategoriesService} from '../categories.service';
import {CategoryData} from 'app-shared/content-shared/categories-search.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kNewCategory',
  templateUrl: './new-category.component.html',
  styleUrls: ['./new-category.component.scss']
})
export class NewCategoryComponent implements OnInit {

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Output() onApply = new EventEmitter<{category: KalturaCategory}>();

  public _isBusy = false;
  public _blockerMessage: AreaBlockerMessage = null;
  public _selectedParentCategory: CategoryData = null;
  public newCategoryForm: FormGroup;

  constructor(private _appLocalization: AppLocalization,
              private _fb: FormBuilder,
              private _categoriesService: CategoriesService) { }

  ngOnInit() {
    this.newCategoryForm = this._fb.group({
      name: ['', Validators.required]
    });
  }

  public _onCategorySelected(event: CategoryData) {
    this._selectedParentCategory = event;
  }

  public _apply(): void {
    this._isBusy = true;
    this._blockerMessage = null;
    this._createNewCategory(this._selectedParentCategory);
  }

  private _createNewCategory(categoryParent: CategoryData) {
    const categoryName = this.newCategoryForm.controls['name'].value;
    if (!categoryName || !categoryName.length) {
      this._blockerMessage = new AreaBlockerMessage({
        message: this._appLocalization.get('applications.content.addNewCategory.errors.requiredName'),
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
    } else {
      this._categoriesService.addNewCategory({categoryParentId: categoryParent && categoryParent.id, name: categoryName})
        .subscribe(category => {
            this._isBusy = false;
            this.onApply.emit({category});
            if (this.parentPopupWidget) {
              this.parentPopupWidget.close();
            }
          },
          error => {
            this._isBusy = false;

            this._blockerMessage = new AreaBlockerMessage(
              {
                message: error.message,
                buttons: [
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
  }
  public _cancel(): void {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.close();
    }
  }
}
