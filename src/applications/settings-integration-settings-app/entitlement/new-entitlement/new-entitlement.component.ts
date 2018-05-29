import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {EntitlementService} from '../entitlement.service';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { BrowserService } from 'app-shared/kmc-shell';

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
  selector: 'kNewEntitlement',
  templateUrl: './new-entitlement.component.html',
  styleUrls: ['./new-entitlement.component.scss'],
  providers: [KalturaLogger.createLogger('NewEntitlementComponent')]
})
export class NewEntitlementComponent implements OnInit, OnDestroy {

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Output() onApply = new EventEmitter<void>();

  public _blockerMessage: AreaBlockerMessage = null;
  public _selectedCategory: number = null;
  public addEntitlementForm: FormGroup;

  constructor(private _appLocalization: AppLocalization,
              private _fb: FormBuilder,
              private _logger: KalturaLogger,
              private _browserService: BrowserService,
              private _entitlementService: EntitlementService) {
    this.addEntitlementForm = this._fb.group({
      privacyContextLabel: ['', [Validators.required, privacyContextLabelValidator()]]
    });
  }

  ngOnInit() {

  }

  ngOnDestroy() {
  }

  public _onCategorySelected(categoryId: number): void {
    this._logger.info(`handle category selected action by user`, { categoryId });
    this._selectedCategory = categoryId;
  }

  public _apply(): void {
    this._logger.info(`handle add entitlement action by user`);
    this._blockerMessage = null;
    const privacyContextLabel = this.addEntitlementForm.controls['privacyContextLabel'].value;
    if (privacyContextLabel && privacyContextLabel.length) {
        this._browserService.confirm({
            header: this._appLocalization.get('applications.settings.integrationSettings.entitlement.addEntitlement.title'),
            message: this._appLocalization.get('applications.settings.integrationSettings.entitlement.addEntitlement.confirmation'),
            accept: () => this._addEntitlement(this._selectedCategory, privacyContextLabel)
        });
    } else {
      this._logger.info(`privacyContextLabel is empty, abort action, show alert`);
      this._blockerMessage = new AreaBlockerMessage({
        message: this._appLocalization
          .get('applications.settings.integrationSettings.entitlement.addEntitlement.errors.requiredPrivacyContextLabel'),
        buttons: [
          {
            label: this._appLocalization.get('app.common.cancel'),
            action: () => {
              this._logger.info(`user canceled, dismiss alert`);
              this._blockerMessage = null;
            }
          }
        ]
      });
    }
  }

  private _addEntitlement(categoryId: number, privacyContext: string): void {
    this._logger.info(`handle add entitlement request by user`);
      this._entitlementService
          .addEntitlement({
              id: categoryId,
              privacyContext,
          })
          .cancelOnDestroy(this)
          .tag('block-shell')
          .subscribe(() => {
              this._logger.info(`handle successful add entitlement request`);
                  this.onApply.emit();
                  if (this.parentPopupWidget) {
                      this.parentPopupWidget.close();
                  }
              },
              error => {
                this._logger.warn(`handle failed add entitlement request, show alert`, { errorMessage: error.message });
                  this._blockerMessage = new AreaBlockerMessage(
                      {
                          message: error.message,
                          buttons: [
                              {
                                  label: this._appLocalization.get('app.common.ok'),
                                  action: () => {
                                    this._logger.info(`user dismissed alert`);
                                      this._blockerMessage = null;
                                  }
                              }
                          ]
                      });
              });
  }

  public _cancel(): void {
    this._logger.info(`handle cancel action by user`);
    if (this.parentPopupWidget) {
      this.parentPopupWidget.close();
    }
  }

}
