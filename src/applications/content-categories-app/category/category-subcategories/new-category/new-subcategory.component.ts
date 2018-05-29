import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {KalturaCategory} from 'kaltura-ngx-client/api/types/KalturaCategory';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization';
import {CategoriesService} from '../../../categories/categories.service';

@Component({
  selector: 'kNewSubcategory',
  templateUrl: './new-subcategory.component.html',
  styleUrls: ['./new-subcategory.component.scss']
})
export class NewSubcategoryComponent implements OnInit, OnDestroy {

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() categoryParentId: number;
  @Output() onSubCategoryAdded = new EventEmitter<{category: KalturaCategory}>();

  public _blockerMessage: AreaBlockerMessage = null;
  public newCategoryForm: FormGroup;

  constructor(private _appLocalization: AppLocalization,
              private _fb: FormBuilder,
              private _categoriesService: CategoriesService) {
  }

  ngOnInit() {
    if (!this.categoryParentId) {
      this._blockerMessage = new AreaBlockerMessage({
        message: this._appLocalization.get('applications.content.addNewCategory.errors.unableToLoadParentCategoryId'),
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
    }
    this.newCategoryForm = this._fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnDestroy() {

  }

  public _apply(): void {
    this._blockerMessage = null;
    this._createNewCategory(this.categoryParentId);
  }

  private _createNewCategory(categoryParentId: number) {
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
      this._categoriesService.addNewCategory({categoryParentId: categoryParentId, name: categoryName})
        .cancelOnDestroy(this)
        .tag('block-shell')
        .subscribe(({category}: {category: KalturaCategory}) => {
            this.onSubCategoryAdded.emit({category});
            if (this.parentPopupWidget) {
              this.parentPopupWidget.close();
            }
          },
          error => {
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
