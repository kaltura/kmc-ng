import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {KalturaCategory} from 'kaltura-ngx-client';
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {AreaBlockerMessage} from "@kaltura-ng/kaltura-ui";
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {BrowserService} from "app-shared/kmc-shell";
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui';
import {EditEntitlementService} from "./edit-entitlement.service";
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';


function privacyContextLabelValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (control.value) {
      // validate that value contains only characters with commas and at least 4 characters
      if (!(/^([A-Za-z0-9]{4,}|[A-Za-z0-9]{4,},(?=[A-Za-z0-9]{4,}))+$/.test(control.value))) {
        return {'privacyContextLabelPattern': true, 'privacyContextTooShort': control.value.length < 4};
      }
    }
    return null;
  };
}

@Component({
  selector: 'kEditEntitlement',
  templateUrl: './edit-entitlement.component.html',
  styleUrls: ['./edit-entitlement.component.scss'],
  providers: [
    EditEntitlementService,
    KalturaLogger.createLogger('EditEntitlementComponent')
  ]
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
              private _logger: KalturaLogger,
              private _browserService: BrowserService) {
  }


  ngOnInit() {
    this._createForm();
  }

  ngOnDestroy(): void {
  }

  private markFormFieldsAsTouched() {
    this._logger.debug(`mark form fields as touched and update value & validity`);
    for (const control in this.editEntitlementForm.controls) {
      this.editEntitlementForm.get(control).markAsTouched();
      this.editEntitlementForm.get(control).updateValueAndValidity();
    }
  }

  public _apply() {
    this._logger.info(`handle edit updated entitlement action by user, show confirmation`);
    if (!this.editEntitlementForm.valid) {
      this._logger.info(`form data is not valid, abort action`);
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
          this._logger.info(`user confirmed, proceed action`);
          this._updateEntitlementPrivacyContext();
        },
        reject: () => {
          this._logger.info(`user didn't confirm, abort action`);
        }
      }
    );
  }

  private _updateEntitlementPrivacyContext() {
    this._logger.info(`handle update request by user`);
    this._updateAreaBlockerState(true, null);
    this._editEntitlementService.updateEntitlementPrivacyContext(this.entitlement.id,
      this.editEntitlementForm.controls['privacyContextLabel'].value)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        result => {
          this._logger.info(`handle successful update request by user`);
          this._updateAreaBlockerState(false, null);
          this.onEntitlementUpdated.emit();
          if (this.ownerPopup) {
            this.ownerPopup.close();
          }
        },
        error => {
          this._logger.warn(`handle failed update request by user, show confirmation`, { errorMessage: error.message });
          const blockerMessage = new AreaBlockerMessage({
            message: error.message || `Error occurred while trying to edit entitlement \'${this.entitlement.name}\'`,
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._logger.info(`user confirmed, retry action`);
                  this._updateEntitlementPrivacyContext();
                }
              }, {
                label: this._appLocalization.get('app.common.cancel'),
                action: () => {
                  this._logger.info(`user didn't confirm, abort action, dismiss dialog`);
                  this._blockerMessage = null;
                }
              }
            ]
          });
          this._updateAreaBlockerState(false, blockerMessage);
        }
      );
  }

  private _updateAreaBlockerState(isBusy: boolean, areaBlocker: AreaBlockerMessage): void {
    this._logger.info(`update areablocker state`, { isBusy, message: areaBlocker ? areaBlocker.message : null });
    this._isBusy = isBusy;
    this._blockerMessage = areaBlocker;
  }


  // Create empty structured form on loading
  private _createForm(): void {
    this.editEntitlementForm = this._fb.group({
      privacyContextLabel: [this.entitlement.privacyContext, [Validators.required, privacyContextLabelValidator()]],
    });
  }
}
