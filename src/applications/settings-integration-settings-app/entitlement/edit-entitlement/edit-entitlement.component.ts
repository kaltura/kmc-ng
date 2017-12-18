import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {KalturaCategory} from "kaltura-ngx-client/api/types/KalturaCategory";
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {AreaBlockerMessage} from "@kaltura-ng/kaltura-ui";
import {AppLocalization} from "@kaltura-ng/kaltura-common";
import {BrowserService} from "app-shared/kmc-shell";
import {PopupWidgetComponent} from "@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component";
import {EditEntitlementService} from "./edit-entitlement.service";


function privacyContextLabelValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (control.value) {
      // validate that value contains only characters with commas and at least 4 characters
      if (!(/^([A-Za-z0-9]{4,}|[A-Za-z0-9]{4,},(?=[A-Za-z0-9]{4,}))+$/.test(control.value)) || !(control.value.length >= 4)) {
        return {'privacyContextLabelPattern': true};
      }
    }
    return null;
  }
}

@Component({
  selector: 'kEditEntitlement',
  templateUrl: './edit-entitlement.component.html',
  styleUrls: ['./edit-entitlement.component.scss'],
  providers: [EditEntitlementService]
})
export class EditEntitlementComponent implements OnInit, OnDestroy {

  @Input() entitlement: KalturaCategory = null;
  @Input() ownerPopup: PopupWidgetComponent;
  @Output() onEntitlementUpdated = new EventEmitter<void>();

  public editEntitlementForm: FormGroup;
  public _blockerMessage: AreaBlockerMessage = null;
  public _isBusy = false;

  constructor(private _editEntitlementService: EditEntitlementService,
              private _appLocalization: AppLocalization,
              private _fb: FormBuilder,
              private _browserService: BrowserService) {
  }


  ngOnInit() {
    this._createForm();
  }

  ngOnDestroy(): void {
  }

  private markFormFieldsAsTouched() {
    for (const control in this.editEntitlementForm.controls) {
      this.editEntitlementForm.get(control).markAsTouched();
      this.editEntitlementForm.get(control).updateValueAndValidity();
    }
  }

  private _apply() {
    if (!this.editEntitlementForm.valid) {
      this.markFormFieldsAsTouched();
      return;
    }

    this._browserService.confirm(
      {
        header: this._appLocalization.get('applications.settings.integrationSettings.entitlement.editEntitlement.confirmationTitle'),
        message: this._appLocalization
          .get('applications.settings.integrationSettings.entitlement.editEntitlement.confirmation',
            {0: this.entitlement.name}),
        accept: () => {
          this._editEntitlementService.updateEntitlementPrivacyContext(this.entitlement.id,
            this.editEntitlementForm.controls['privacyContextLabel'].value)
            .cancelOnDestroy(this)
            .tag('block-shell')
            .subscribe(
              result => {
                this.onEntitlementUpdated.emit();
                this.ownerPopup.close();
              },
              error => {
                this._updateAreaBlockerState(false, error.message);
              }
            );
        }
      }
    );
  }


  private _updateAreaBlockerState(isBusy: boolean, message: AreaBlockerMessage): void {
    this._isBusy = isBusy;
    this._blockerMessage = message;
  }

  // Create empty structured form on loading
  private _createForm(): void {
    this.editEntitlementForm = this._fb.group({
      privacyContextLabel: [this.entitlement.privacyContext, [Validators.required, privacyContextLabelValidator()]],
    });
  }
}
