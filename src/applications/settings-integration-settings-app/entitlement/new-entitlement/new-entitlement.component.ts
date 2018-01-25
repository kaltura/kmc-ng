import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {EntitlementService} from '../entitlement.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import { KalturaCategory } from 'kaltura-ngx-client/api/types/KalturaCategory';

function privacyContextLabelValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (control.value) {
      // validate that value contains only characters with commas and at least 4 characters
      if (!(/^([A-Za-z0-9]{4,}|[A-Za-z0-9]{4,},(?=[A-Za-z0-9]{4,}))+$/.test(control.value))) {
        return {'privacyContextLabelPattern': true, 'privacyContextTooShort': control.value.length < 4};
      }
    }
    return null;
  }
}

@Component({
  selector: 'kNewEntitlement',
  templateUrl: './new-entitlement.component.html',
  styleUrls: ['./new-entitlement.component.scss']
})
export class NewEntitlementComponent implements OnInit, OnDestroy {

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Output() onApply = new EventEmitter<void>();

  public _blockerMessage: AreaBlockerMessage = null;
  public _selectedCategory: number = null;
  public addEntitlementForm: FormGroup;

  constructor(private _appLocalization: AppLocalization,
              private _fb: FormBuilder,
              private _entitlementService: EntitlementService) {
    this.addEntitlementForm = this._fb.group({
      privacyContextLabel: ['', [Validators.required, privacyContextLabelValidator()]]
    });
  }

  ngOnInit() {

  }

  ngOnDestroy() {
  }

  public _onCategorySelected(event: number) {
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

  private _addEntitlment(categoryId: number, privacyContext: string): void {
    // validate the selected category do not have privacy context
    this._entitlementService.getCategoryById(categoryId)
        .cancelOnDestroy(this)
	    .tag('block-shell')
        .subscribe(
        (category: KalturaCategory)=>{
          if (category.privacyContext && category.privacyContext.length){
            this._blockerMessage = new AreaBlockerMessage(
                {
                  message: this._appLocalization.get('applications.settings.integrationSettings.entitlement.editEntitlement.errors.privacyContextLabelExists'),
                  buttons: [
                    {
                      label: this._appLocalization.get('app.common.ok'),
                      action: () => {
                        this._blockerMessage = null;
                      }
                    }
                  ]
                });
          }else{
            this._entitlementService
	            .addEntitlement({
                  id: categoryId,
                  privacyContext,
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
        }
    );
  }

  public _cancel(): void {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.close();
    }
  }

}
