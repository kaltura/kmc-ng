import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';

@Component({
  selector: 'kNotifyOwner',
  templateUrl: './notify-owner.component.html',
  styleUrls: ['./notify-owner.component.scss'],
  providers: [
      KalturaLogger.createLogger('kNotifyOwner')
  ]
})
  export class NotifyOwnerComponent {
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Output() onNotify = new EventEmitter<{subject: string, body: string}>();

  public _notifyForm: FormGroup;

  public get _saveDisabled(): boolean {
    return !this._notifyForm.valid;
  }

  constructor(private _fb: FormBuilder,
              private _logger: KalturaLogger) {
    this._buildForm();
  }

  private _buildForm(): void {
    this._notifyForm = this._fb.group({
      subject: ['Changes planned on your entries', Validators.required],
      body: [`Hi,

You receiving this email because your Kaltura admin may make changes to one or more of the media entries you own. For more information, please reach out to your system administrator: [Insert your email address].

Thank you,
The Kaltura team

This is a system generated message. Please do not reply to this email.` , Validators.required]
    });
  }

    private _markFormFieldsAsTouched() {
        for (const controlName in this._notifyForm.controls) {
            if (this._notifyForm.controls.hasOwnProperty(controlName)) {
                this._notifyForm.get(controlName).markAsTouched();
                this._notifyForm.get(controlName).updateValueAndValidity();
            }
        }
        this._notifyForm.updateValueAndValidity();
    }

    private _markFormFieldsAsPristine() {
        for (const controlName in this._notifyForm.controls) {
            if (this._notifyForm.controls.hasOwnProperty(controlName)) {
                this._notifyForm.get(controlName).markAsPristine();
                this._notifyForm.get(controlName).updateValueAndValidity();
            }
        }
        this._notifyForm.updateValueAndValidity();
    }

  public notify(): void {
    this._logger.info(`send notify owner eventr`);

      if (!this._notifyForm.valid) {
          this._markFormFieldsAsTouched();
          this._logger.info(`abort action, form has invalid data`);
          return;
      }

      this._markFormFieldsAsPristine();

    const { subject, body } = this._notifyForm.value;
    this.onNotify.emit({subject, body})
  }
}
