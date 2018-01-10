import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {EntitlementService} from '../entitlement.service';
import {CategoryData} from 'app-shared/content-shared/categories/categories-search.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kNewEntitlement',
  templateUrl: './new-entitlement.component.html',
  styleUrls: ['./new-entitlement.component.scss']
})
export class NewEntitlementComponent implements OnInit, OnDestroy {

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Output() onApply = new EventEmitter<void>();

  public _blockerMessage: AreaBlockerMessage = null;
  public _selectedCategory: CategoryData = null;
  public addEntitlementForm: FormGroup;

  constructor(private _appLocalization: AppLocalization,
              private _fb: FormBuilder,
              private _entitlementService: EntitlementService) {
    this.addEntitlementForm = this._fb.group({
      privacyContextLabel: ['', Validators.required]
    });
  }

  ngOnInit() {

  }

  ngOnDestroy() {
  }

  public _onCategorySelected(event: CategoryData) {
    this._selectedCategory = event;
  }

  public _apply(): void {
    this._blockerMessage = null;
    const privacyContextLabel = this.addEntitlementForm.controls['privacyContextLabel'].value;
    if (privacyContextLabel && privacyContextLabel.length) {
      this._addEntitlment(this._selectedCategory, privacyContextLabel);
    } else {
      this._blockerMessage = new AreaBlockerMessage({
        message: this._appLocalization
          .get('applications.settings.integrationSettings.entitlement.addEntitlement.errors.requiredPrivacyContextLabel'),
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
  }

  private _addEntitlment(category: CategoryData, privacyContextLabel: string): void {
    this._entitlementService
      .addEntitlement({
        categoryId: category && category.id,
        privacyContextLabel,
      })
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(() => {
          this.onApply.emit();
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
                  label: this._appLocalization.get('app.common.ok'),
                  action: () => {
                    this._blockerMessage = null;
                  }
                }
              ]
            });
        });
  }

  public _cancel(): void {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.close();
    }
  }

}
