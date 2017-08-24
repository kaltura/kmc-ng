import {Component, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {AccountUpgrade, SettingsAccountUpgradeService} from './settings-account-upgrade.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import {BrowserService} from 'app-shared/kmc-shell/providers/browser.service';
import {PhoneValidator} from './phone.validator';


@Component({
  selector: 'kmc-settings-account-upgrade',
  templateUrl: './settings-account-upgrade.component.html',
  styleUrls: ['./settings-account-upgrade.component.scss'],
  providers: [SettingsAccountUpgradeService],
})
export class SettingsAccountUpgradeComponent implements OnInit, OnDestroy {


  public contactUsForm: FormGroup;
  public _blockerMessage: AreaBlockerMessage = null;
  public _isBusy = false;

  constructor(private _accountUpgradeService: SettingsAccountUpgradeService,
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
    this._updateAreaBlockerState(true, null);
    this._accountUpgradeService
      .sendContactSalesForceInformation(<AccountUpgrade>this.contactUsForm.value)
      .cancelOnDestroy(this)
      .subscribe(response => {
          // this._fillForm(updatedPartner);
          this._updateAreaBlockerState(false, null);
          this._browserService.alert(
            {
              header: ' ',
              message: this._appLocalization.get('applications.settings.accountUpgrade.sendSuccess')
            }
          );
        },
        error => {
          const blockerMessage = new AreaBlockerMessage(
            {
              message: this._appLocalization.get('applications.settings.accountUpgrade.errors.sendFailed'),
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
      phone: ['', [Validators.required, PhoneValidator]],
      comments: [''],
    });
  }


}
