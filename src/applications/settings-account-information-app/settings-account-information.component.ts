import {Component, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {SettingsAccountInformationService} from './settings-account-information.service';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import {BrowserService} from 'app-shared/kmc-shell/providers/browser.service';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import { SettingsAccountInformationMainViewService } from 'app-shared/kmc-shared/kmc-views';

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
  providers: [
    SettingsAccountInformationService,
    KalturaLogger.createLogger('SettingsAccountInformationComponent')
  ],
})
export class SettingsAccountInformationComponent implements OnInit, OnDestroy {


  public contactUsForm: FormGroup;
  public _blockerMessage: AreaBlockerMessage = null;
  public _isBusy = false;
  public _canContactSalesForceInformation = true;

  constructor(private _accountInformationService: SettingsAccountInformationService,
              private _appLocalization: AppLocalization,
              private _fb: FormBuilder,
              private _browserService: BrowserService,
              private _logger: KalturaLogger,
              private _settingsAccountInformationMainView: SettingsAccountInformationMainViewService) {
  }

  ngOnInit() {
      this._logger.info(`initiate account information view`);
      this._createForm();

    if (this._settingsAccountInformationMainView.viewEntered()) {
        this._prepare();
    }
  }

  ngOnDestroy(): void {
  }

  private _prepare(): void {
      this._canContactSalesForceInformation = this._accountInformationService.canContactSalesForceInformation();
      if (!this._canContactSalesForceInformation) {
          this._logger.warn('Cannot send message to SalesForce: missing \'contactsalesforce\' configuration');
      }
  }
    onSubmit(): void {
        this._logger.info(`handle sending sales force info action by user`);
    if (this.contactUsForm.valid) {
      this._sendContactSalesForceInformation();
    } else {
      this._logger.info(`form data is not valid, abort action`);
      this.markFormFieldsAsTouched();
    }
  }

  private markFormFieldsAsTouched() {
    this._logger.info(`mark fields as touched and update value & validity`);
    for (const control in this.contactUsForm.controls) {
      this.contactUsForm.get(control).markAsTouched();
      this.contactUsForm.get(control).updateValueAndValidity();
    }
  }

  private _sendContactSalesForceInformation() {
    this._logger.info(`handle send sales force info request by user`);
    this._updateAreaBlockerState(true, null);
    this._accountInformationService
      .sendContactSalesForceInformation(this.contactUsForm.value)
      .cancelOnDestroy(this)
      .subscribe(() => {
          this._logger.info(`handle successful send action, show alert`);
          this._updateAreaBlockerState(false, null);
          this._browserService.alert(
            {
              header: this._appLocalization.get('applications.settings.accountInformation.sendSuccessHeader'),
              message: this._appLocalization.get('applications.settings.accountInformation.sendSuccessBody'),
              accept: () => {
                this._logger.info(`user dismissed alert message`);
              }
            }
          );
        },
        error => {
          this._logger.info(`handle failed send action, show alert`, { errorMessage: error.message });
          const blockerMessage = new AreaBlockerMessage(
            {
              message: this._appLocalization.get('applications.settings.accountInformation.errors.sendFailed'),
              buttons: [
                {
                  label: this._appLocalization.get('app.common.ok'),
                  action: () => {
                    this._logger.info(`user dismissed alert message`);
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
    this._logger.debug(`update areablocker state`, { isBusy, message: message ? message.message : null });
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
