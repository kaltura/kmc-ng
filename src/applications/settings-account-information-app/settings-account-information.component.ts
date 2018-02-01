import {Component, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {SettingsAccountInformationService} from './settings-account-information.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import {BrowserService} from 'app-shared/kmc-shell/providers/browser.service';


function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: boolean} | null => {
    if (control.value) {
      // validate that value contains only hyphens and at least 7 digits
      if (!(/(^[\d\-)(+ ]+$)/.test(control.value)) || !(control.value.replace(/[^0-9]/g, '').length >= 7)) {
        return {'phonePattern': true};
      }
    }
    return null;
  }
}

@Component({
  selector: 'kmc-settings-account-information',
  templateUrl: './settings-account-information.component.html',
  styleUrls: ['./settings-account-information.component.scss'],
  providers: [SettingsAccountInformationService],
})
export class SettingsAccountInformationComponent implements OnInit, OnDestroy {


  public contactUsForm: FormGroup;
  public _blockerMessage: AreaBlockerMessage = null;
  public _isBusy = false;

  constructor(private _accountInformationService: SettingsAccountInformationService,
              private _appLocalization: AppLocalization,
              private _fb: FormBuilder,
              private _browserService: BrowserService) {
  }

  ngOnInit() {
    this._createForm();
  }

  ngOnDestroy(): void {
  }

  onSubmit(): void {
    if (this.contactUsForm.valid) {
      this._sendContactSalesForceInformation();
    } else {
      this.markFormFieldsAsTouched();
    }
  }

  private markFormFieldsAsTouched() {
    for (const control in this.contactUsForm.controls) {
      this.contactUsForm.get(control).markAsTouched();
      this.contactUsForm.get(control).updateValueAndValidity();
    }
  }

  private _sendContactSalesForceInformation() {
    if (!this.contactUsForm.valid) {
      return;
    }

    this._updateAreaBlockerState(true, null);
    this._accountInformationService
      .sendContactSalesForceInformation(this.contactUsForm.value)
      .cancelOnDestroy(this)
      .subscribe(() => {
          // this._fillForm(updatedPartner);
          this._updateAreaBlockerState(false, null);
          this._browserService.alert(
            {
              header: this._appLocalization.get('applications.settings.accountInformation.sendSuccessHeader'),
              message: this._appLocalization.get('applications.settings.accountInformation.sendSuccessBody')
            }
          );
        },
        error => {
          const blockerMessage = new AreaBlockerMessage(
            {
              message: this._appLocalization.get('applications.settings.accountInformation.errors.sendFailed'),
              buttons: [
                {
                  label: this._appLocalization.get('app.common.ok'),
                  action: () => {
                    this._updateAreaBlockerState(false, null);
                  }
                }
              ]
            }
          );
          this._updateAreaBlockerState(false, blockerMessage);
        });
  }


  private _updateAreaBlockerState(isBusy: boolean, message: AreaBlockerMessage): void {
    this._isBusy = isBusy;
    this._blockerMessage = message;
  }

  // Create empty structured form on loading
  private _createForm(): void {
    this.contactUsForm = this._fb.group({
      name: [''],
      phone: ['', [Validators.required, phoneValidator()]],
      comments: [''],
    });
  }

}
