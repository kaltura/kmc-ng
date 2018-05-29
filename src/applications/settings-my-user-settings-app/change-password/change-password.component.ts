import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import {KalturaUser} from 'kaltura-ngx-client/api/types/KalturaUser';
import {UserUpdateLoginDataActionArgs} from 'kaltura-ngx-client/api/types/UserUpdateLoginDataAction';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

@Component({
  selector: 'kChangePassword',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  providers: [KalturaLogger.createLogger('ChangePasswordComponent')]
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() user: KalturaUser;
  @Input() blockerMessage: AreaBlockerMessage;

  @Output() updateLoginData = new EventEmitter<UserUpdateLoginDataActionArgs>();

  public _changePasswordForm: FormGroup;

  constructor(private _fb: FormBuilder,
              private _logger: KalturaLogger) {
  }

  ngOnInit() {
    this._createForm();
  }

  ngOnDestroy() {
  }

  public _passwordMatchValidator(passControl: AbstractControl): ValidationErrors | null {
    return passControl.parent && passControl.parent.value.newPassword === passControl.value ? null : { 'mismatch': true };
  }

  // Create empty structured form on loading
  private _createForm(): void {
    this._changePasswordForm = this._fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      reTypeNewPassword: ['', Validators.compose([Validators.required, this._passwordMatchValidator])]
    });
  }

  public _updateLoginData(): void {
    this._logger.info(`handle send update password action by user`);
    if (this._changePasswordForm.valid) {
      const formData = this._changePasswordForm.value;
      this.updateLoginData.emit({
        oldLoginId: this.user.email,
        password: formData.currentPassword,
        newPassword: formData.newPassword,
      });
    } else {
      this._logger.info(`change password form is not valid, abort action`, { errors: this._changePasswordForm.errors });
    }
  }
}
